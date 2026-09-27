"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartones,
  compradores,
  localidades,
  rendiciones,
  vendedores,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { canManageCatalog, canManageLots } from "@/lib/scope";
import { generateBingoNumbers, talonarioFor } from "@/lib/bingo";
import { SERIE_DEFAULT } from "@/lib/constants";
import { vendedorEstadoCaja } from "@/lib/queries";

async function adminOrReferente() {
  const session = await getSession();
  if (!session || !canManageCatalog(session)) throw new Error("Sin permiso");
  return session;
}

export async function crearLocalidad(formData: FormData) {
  await adminOrReferente();
  const nombre = String(formData.get("nombre") || "").trim();
  const provincia = String(formData.get("provincia") || "").trim();
  const departamentoZona = String(formData.get("departamentoZona") || "").trim();
  if (!nombre || !provincia || !departamentoZona) return { error: "Completá nombre, provincia y zona" };
  await db.insert(localidades).values({
    nombre,
    provincia,
    departamentoZona,
    referenteLocal: String(formData.get("referenteLocal") || "").trim() || null,
    telefonoReferente: String(formData.get("telefonoReferente") || "").trim() || null,
  });
  revalidatePath("/localidades");
  return { ok: true };
}

export async function eliminarLocalidad(id: number) {
  await adminOrReferente();
  const [used] = await db
    .select({ c: sql<number>`count(*)` })
    .from(cartones)
    .where(eq(cartones.localidadId, id));
  if (Number(used?.c ?? 0) > 0) {
    return { error: "No se puede eliminar: la localidad tiene cartones asociados. Reasigná o anulá primero." };
  }
  await db.delete(localidades).where(eq(localidades.id, id));
  revalidatePath("/localidades");
  return { ok: true };
}

export async function crearVendedor(formData: FormData) {
  await adminOrReferente();
  const codigoVendedor = String(formData.get("codigoVendedor") || "").trim().toUpperCase();
  const nombreCompleto = String(formData.get("nombreCompleto") || "").trim().toUpperCase();
  const dni = String(formData.get("dni") || "").replace(/\D/g, "");
  const localidadId = Number(formData.get("localidadId"));
  if (!codigoVendedor || !nombreCompleto || !dni || !localidadId) {
    return { error: "Código, nombre, DNI y localidad son obligatorios" };
  }
  await db.insert(vendedores).values({
    codigoVendedor,
    nombreCompleto,
    dni,
    telefono: String(formData.get("telefono") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    localidadId,
    comisionPorcentaje: String(formData.get("comisionPorcentaje") || "15.00"),
    estado: "activo",
  });
  revalidatePath("/vendedores");
  return { ok: true };
}

export async function inactivarVendedor(id: number) {
  await adminOrReferente();
  await db
    .update(vendedores)
    .set({ estado: "inactivo", updatedAt: new Date() })
    .where(eq(vendedores.id, id));
  revalidatePath("/vendedores");
  return { ok: true };
}

export async function eliminarVendedor(id: number) {
  await adminOrReferente();
  const [used] = await db
    .select({ c: sql<number>`count(*)` })
    .from(cartones)
    .where(eq(cartones.vendedorId, id));
  if (Number(used?.c ?? 0) > 0) {
    return {
      error:
        "No se puede eliminar: el vendedor tiene cartones. Sugerencia: inactivarlo para conservar la trazabilidad.",
    };
  }
  await db.delete(vendedores).where(eq(vendedores.id, id));
  revalidatePath("/vendedores");
  return { ok: true };
}

export async function crearComprador(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "No autenticado" };
  const nombreCompleto = String(formData.get("nombreCompleto") || "").trim().toUpperCase();
  const dni = String(formData.get("dni") || "").replace(/\D/g, "");
  if (!nombreCompleto) return { error: "El NOMBRE COMPLETO es OBLIGATORIO para validar ganadores" };
  if (!/^[0-9]{7,9}$/.test(dni)) return { error: "El DNI debe tener entre 7 y 9 dígitos" };
  await db.insert(compradores).values({
    nombreCompleto,
    dni,
    telefono: String(formData.get("telefono") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    direccion: String(formData.get("direccion") || "").trim() || null,
    localidadId: formData.get("localidadId") ? Number(formData.get("localidadId")) : null,
  });
  revalidatePath("/compradores");
  return { ok: true };
}

export async function generarLote(formData: FormData) {
  const session = await getSession();
  if (!session || !canManageLots(session)) return { error: "Solo administración puede generar lotes" };
  const desde = Number(formData.get("desde"));
  const hasta = Number(formData.get("hasta"));
  const serie = String(formData.get("serie") || SERIE_DEFAULT).trim() || SERIE_DEFAULT;
  const precio = String(formData.get("precio") || "5000.00");
  const vendedorIdRaw = String(formData.get("vendedorId") || "");
  const vendedorId = vendedorIdRaw ? Number(vendedorIdRaw) : null;
  if (!Number.isFinite(desde) || !Number.isFinite(hasta) || hasta < desde) {
    return { error: "Rango inválido" };
  }
  if (hasta - desde + 1 > 1000) return { error: "Máximo 1000 cartones por lote" };

  const existentes = await db
    .select({ numeroCarton: cartones.numeroCarton })
    .from(cartones)
    .where(and(gte(cartones.numeroCarton, desde), lte(cartones.numeroCarton, hasta)));
  if (existentes.length) {
    const ejemplos = existentes.slice(0, 8).map((e) => e.numeroCarton).join(", ");
    return {
      error: `Hay ${existentes.length} números ya existentes en el rango (ej: ${ejemplos}${existentes.length > 8 ? "…" : ""}). El lote fue rechazado.`,
    };
  }

  let localidadId: number | null = null;
  if (vendedorId) {
    const [v] = await db.select().from(vendedores).where(eq(vendedores.id, vendedorId)).limit(1);
    localidadId = v?.localidadId ?? null;
  }

  const values = [];
  for (let n = desde; n <= hasta; n++) {
    values.push({
      numeroCarton: n,
      serie,
      talonario: talonarioFor(n, desde),
      precio,
      estado: (vendedorId ? "asignado" : "disponible") as "asignado" | "disponible",
      vendedorId,
      localidadId,
      numerosBingo: generateBingoNumbers(n),
    });
  }
  const chunk = 200;
  for (let i = 0; i < values.length; i += chunk) {
    await db.insert(cartones).values(values.slice(i, i + chunk));
  }
  revalidatePath("/cartones");
  return { ok: true, creados: values.length };
}

export async function asignarLote(formData: FormData) {
  const session = await getSession();
  if (!session || !canManageLots(session)) return { error: "Solo administración puede asignar lotes" };
  const vendedorId = Number(formData.get("vendedorId"));
  const desde = Number(formData.get("desde"));
  const hasta = Number(formData.get("hasta"));
  if (!vendedorId || !desde || !hasta) return { error: "Completá vendedor y rango" };
  const [vend] = await db.select().from(vendedores).where(eq(vendedores.id, vendedorId)).limit(1);
  if (!vend) return { error: "Vendedor inexistente" };

  const disponibles = await db
    .select({ id: cartones.id, numeroCarton: cartones.numeroCarton, estado: cartones.estado })
    .from(cartones)
    .where(and(gte(cartones.numeroCarton, desde), lte(cartones.numeroCarton, hasta)));

  const ids = disponibles.filter((c) => c.estado === "disponible").map((c) => c.id);
  if (!ids.length) {
    return { error: "No hay cartones en estado DISPONIBLE en ese rango/talonario" };
  }
  await db
    .update(cartones)
    .set({
      estado: "asignado",
      vendedorId: vend.id,
      localidadId: vend.localidadId,
      updatedAt: new Date(),
    })
    .where(inArray(cartones.id, ids));
  revalidatePath("/cartones");
  return { ok: true, asignados: ids.length };
}

export async function crearRendicion(formData: FormData) {
  const session = await getSession();
  if (!session || !canManageCatalog(session)) return { error: "Sin permiso" };
  const vendedorId = Number(formData.get("vendedorId"));
  const caja = await vendedorEstadoCaja(vendedorId);
  if (!caja) return { error: "Vendedor inexistente" };
  const devueltos = Number(formData.get("cartonesDevueltos") || 0);
  const totalRendido = Number(formData.get("totalRendido") || 0);
  const estado = String(formData.get("estado") || "pendiente") as
    | "pendiente"
    | "parcial"
    | "saldado"
    | "auditado";
  const aRendir = caja.aRendir;
  const diferencia = Math.round((totalRendido - aRendir) * 100) / 100;

  const [last] = await db
    .select({ codigo: rendiciones.codigoRendicion })
    .from(rendiciones)
    .orderBy(sql`${rendiciones.id} desc`)
    .limit(1);
  let next = 1;
  if (last?.codigo) {
    const m = last.codigo.match(/(\d+)$/);
    if (m) next = Number(m[1]) + 1;
  }

  await db.insert(rendiciones).values({
    codigoRendicion: `RND-2026-${String(next).padStart(4, "0")}`,
    vendedorId,
    localidadId: caja.vendedor.localidadId,
    cartonesEntregados: caja.entregados,
    cartonesVendidos: caja.vendidos,
    cartonesDevueltos: devueltos,
    totalBruto: caja.bruto.toFixed(2),
    comisionRetenida: caja.comision.toFixed(2),
    totalARendir: aRendir.toFixed(2),
    totalRendido: totalRendido.toFixed(2),
    diferencia: diferencia.toFixed(2),
    estado,
    observaciones: String(formData.get("observaciones") || "").trim() || null,
    comprobanteDeposito: String(formData.get("comprobanteDeposito") || "").trim() || null,
  });
  revalidatePath("/rendiciones");
  return { ok: true };
}
