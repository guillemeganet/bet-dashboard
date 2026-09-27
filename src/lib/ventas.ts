import { db } from "@/db";
import { cartones, compradores, vendedores, ventas } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DNI_REGEX } from "./constants";
import type { SessionUser } from "./auth";

export type VentaInput = {
  numeroCarton: number;
  dni: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  vendedorId: number;
  localidadId: number;
  metodoPago: string;
  monto?: number;
  comprobantePago?: string;
  observaciones?: string;
};

export type VentaError = {
  status: number;
  message: string;
  extra?: Record<string, string | number | null>;
};

export async function registrarVenta(input: VentaInput, session: SessionUser) {
  const nombre = (input.nombreCompleto || "").trim().toUpperCase();
  const dni = (input.dni || "").replace(/\D/g, "");

  if (!nombre) {
    return {
      error: {
        status: 422,
        message: "El NOMBRE COMPLETO es OBLIGATORIO para validar ganadores",
      } satisfies VentaError,
    };
  }
  if (!DNI_REGEX.test(dni)) {
    return {
      error: {
        status: 422,
        message: "El DNI debe tener entre 7 y 9 dígitos numéricos (sin puntos ni letras)",
      } satisfies VentaError,
    };
  }
  if (!["efectivo", "transferencia", "mercadopago", "debito"].includes(input.metodoPago)) {
    return {
      error: { status: 422, message: "Método de pago inválido" } satisfies VentaError,
    };
  }
  if (input.metodoPago !== "efectivo" && !input.comprobantePago?.trim()) {
    return {
      error: {
        status: 422,
        message: "El comprobante de pago es obligatorio si no es efectivo",
      } satisfies VentaError,
    };
  }

  if (session.role === "vendedor" && session.vendedorId && session.vendedorId !== input.vendedorId) {
    return {
      error: { status: 403, message: "Solo podés registrar ventas a tu nombre" } satisfies VentaError,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const locked = await tx
        .select()
        .from(cartones)
        .where(eq(cartones.numeroCarton, input.numeroCarton))
        .for("update");
      const carton = locked[0];
      if (!carton) {
        throw Object.assign(new Error("CARTON_404"), { code: "CARTON_404" });
      }
      if (carton.estado === "vendido") {
        const [existente] = await tx
          .select({
            recibo: ventas.codigoRecibo,
            titular: compradores.nombreCompleto,
            dni: compradores.dni,
          })
          .from(ventas)
          .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
          .where(eq(ventas.cartonId, carton.id))
          .limit(1);
        throw Object.assign(new Error("VENDIDO"), {
          code: "VENDIDO",
          extra: existente,
        });
      }
      if (carton.estado === "anulado") {
        throw Object.assign(new Error("ANULADO"), { code: "ANULADO" });
      }
      if (carton.estado === "devuelto") {
        throw Object.assign(new Error("DEVUELTO"), { code: "DEVUELTO" });
      }

      const [vend] = await tx
        .select()
        .from(vendedores)
        .where(eq(vendedores.id, input.vendedorId))
        .limit(1);
      if (!vend) throw Object.assign(new Error("VEND_404"), { code: "VEND_404" });
      if (vend.estado !== "activo") {
        throw Object.assign(new Error("VEND_INACTIVO"), { code: "VEND_INACTIVO" });
      }

      const [existingBuyer] = await tx
        .select()
        .from(compradores)
        .where(eq(compradores.dni, dni))
        .limit(1);

      let compradorId: number;
      if (existingBuyer) {
        await tx
          .update(compradores)
          .set({
            nombreCompleto: nombre,
            telefono: input.telefono?.trim() || existingBuyer.telefono,
            email: input.email?.trim() || existingBuyer.email,
            direccion: input.direccion?.trim() || existingBuyer.direccion,
            localidadId: input.localidadId,
            updatedAt: new Date(),
          })
          .where(eq(compradores.id, existingBuyer.id));
        compradorId = existingBuyer.id;
      } else {
        const [created] = await tx
          .insert(compradores)
          .values({
            nombreCompleto: nombre,
            dni,
            telefono: input.telefono?.trim() || null,
            email: input.email?.trim() || null,
            direccion: input.direccion?.trim() || null,
            localidadId: input.localidadId,
          })
          .returning();
        compradorId = created.id;
      }

      const [last] = await tx
        .select({ codigo: ventas.codigoRecibo })
        .from(ventas)
        .orderBy(desc(ventas.id))
        .limit(1);
      let next = 1;
      if (last?.codigo) {
        const m = last.codigo.match(/(\d+)$/);
        if (m) next = Number(m[1]) + 1;
      }
      const codigoRecibo = `REC-2026-${String(next).padStart(5, "0")}`;
      const monto = (input.monto && input.monto > 0 ? input.monto : Number(carton.precio)).toFixed(2);

      const [venta] = await tx
        .insert(ventas)
        .values({
          codigoRecibo,
          cartonId: carton.id,
          compradorId,
          vendedorId: input.vendedorId,
          localidadId: input.localidadId,
          fechaVenta: new Date(),
          monto,
          metodoPago: input.metodoPago,
          comprobantePago: input.comprobantePago?.trim() || null,
          observaciones: input.observaciones?.trim() || null,
          estadoPago: "cobrado",
        })
        .returning();

      await tx
        .update(cartones)
        .set({
          estado: "vendido",
          vendedorId: input.vendedorId,
          localidadId: input.localidadId,
          updatedAt: new Date(),
        })
        .where(eq(cartones.id, carton.id));

      return venta;
    });

    return { venta: result };
  } catch (err) {
    const e = err as { code?: string; extra?: Record<string, string> };
    if (e.code === "CARTON_404") {
      return { error: { status: 404, message: "El cartón no existe en el padrón provincial" } };
    }
    if (e.code === "VENDIDO") {
      return {
        error: {
          status: 409,
          message: `Cartón ya vendido. Titular: ${e.extra?.titular ?? "—"} · DNI ${e.extra?.dni ?? "—"} · Recibo ${e.extra?.recibo ?? "—"}`,
          extra: e.extra,
        },
      };
    }
    if (e.code === "ANULADO") {
      return { error: { status: 409, message: "Este cartón está ANULADO y no puede venderse" } };
    }
    if (e.code === "DEVUELTO") {
      return { error: { status: 409, message: "Este cartón está DEVUELTO y no puede venderse" } };
    }
    if (e.code === "VEND_404") {
      return { error: { status: 422, message: "El vendedor no existe" } };
    }
    if (e.code === "VEND_INACTIVO") {
      return { error: { status: 422, message: "El vendedor no está activo" } };
    }
    throw err;
  }
}
