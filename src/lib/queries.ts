import { db } from "@/db";
import {
  cartones,
  compradores,
  localidades,
  premiosSorteo,
  rendiciones,
  vendedores,
  ventas,
} from "@/db/schema";
import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import type { SessionUser } from "./auth";
import { combine, scopeCartones, scopeVentas } from "./scope";
import { toNumber } from "./format";
import { PROVINCIAS } from "./constants";

export async function getTickerStats(session: SessionUser) {
  const ventaScope = scopeVentas(session);
  const [agg] = await db
    .select({
      recaudacion: sum(ventas.monto),
      vendidos: count(ventas.id),
    })
    .from(ventas)
    .where(ventaScope);

  const [cartonAgg] = await db
    .select({ total: count(cartones.id) })
    .from(cartones)
    .where(session.role === "vendedor" || session.role === "referente" ? scopeCartones(session) : undefined);

  const [vendAgg] = await db
    .select({
      activos: sql<number>`count(*) filter (where ${vendedores.estado} = 'activo')`,
      total: count(vendedores.id),
    })
    .from(vendedores)
    .where(
      session.role === "referente" && session.localidadId
        ? eq(vendedores.localidadId, session.localidadId)
        : undefined,
    );

  const ultima = await db
    .select({
      numeroCarton: cartones.numeroCarton,
      titular: compradores.nombreCompleto,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      fecha: ventas.fechaVenta,
      monto: ventas.monto,
      recibo: ventas.codigoRecibo,
    })
    .from(ventas)
    .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
    .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(ventaScope)
    .orderBy(desc(ventas.fechaVenta), desc(ventas.id))
    .limit(1);

  return {
    recaudacion: toNumber(agg?.recaudacion),
    vendidos: Number(agg?.vendidos ?? 0),
    totalCartones: Number(cartonAgg?.total ?? 0),
    vendedoresActivos: Number(vendAgg?.activos ?? 0),
    vendedoresTotal: Number(vendAgg?.total ?? 0),
    ultima: ultima[0] ?? null,
  };
}

export async function getDashboard(session: SessionUser) {
  const ventaScope = scopeVentas(session);
  const cartonScope = scopeCartones(session);

  const [ventaAgg] = await db
    .select({
      recaudacion: sum(ventas.monto),
      vendidos: count(ventas.id),
    })
    .from(ventas)
    .where(ventaScope);

  const [cartonAgg] = await db
    .select({
      total: count(cartones.id),
      disponibles: sql<number>`count(*) filter (where ${cartones.estado} = 'disponible')`,
      asignados: sql<number>`count(*) filter (where ${cartones.estado} = 'asignado')`,
      vendidos: sql<number>`count(*) filter (where ${cartones.estado} = 'vendido')`,
      potencial: sql<number>`coalesce(sum(${cartones.precio}::numeric), 0)`,
    })
    .from(cartones)
    .where(cartonScope);

  const [vendAgg] = await db
    .select({
      activos: sql<number>`count(*) filter (where ${vendedores.estado} = 'activo')`,
      total: count(vendedores.id),
    })
    .from(vendedores)
    .where(
      session.role === "referente" && session.localidadId
        ? eq(vendedores.localidadId, session.localidadId)
        : session.role === "vendedor" && session.vendedorId
          ? eq(vendedores.id, session.vendedorId)
          : undefined,
    );

  const [padron] = await db.select({ total: count(compradores.id) }).from(compradores);

  const porProvincia = await db
    .select({
      provincia: localidades.provincia,
      vendidos: count(ventas.id),
      recaudacion: sum(ventas.monto),
    })
    .from(ventas)
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(ventaScope)
    .groupBy(localidades.provincia);

  const cartonPorProv = await db
    .select({
      provincia: localidades.provincia,
      total: count(cartones.id),
    })
    .from(cartones)
    .leftJoin(localidades, eq(cartones.localidadId, localidades.id))
    .groupBy(localidades.provincia);

  const topVendedores = await db
    .select({
      id: vendedores.id,
      nombre: vendedores.nombreCompleto,
      codigo: vendedores.codigoVendedor,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      cartones: count(ventas.id),
      recaudacion: sum(ventas.monto),
    })
    .from(ventas)
    .innerJoin(vendedores, eq(ventas.vendedorId, vendedores.id))
    .innerJoin(localidades, eq(vendedores.localidadId, localidades.id))
    .where(ventaScope)
    .groupBy(
      vendedores.id,
      vendedores.nombreCompleto,
      vendedores.codigoVendedor,
      localidades.nombre,
      localidades.provincia,
    )
    .orderBy(desc(count(ventas.id)))
    .limit(8);

  const premios = await db
    .select({
      premio: premiosSorteo,
      numeroCarton: cartones.numeroCarton,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
    })
    .from(premiosSorteo)
    .leftJoin(cartones, eq(premiosSorteo.cartonGanadorId, cartones.id))
    .leftJoin(ventas, eq(ventas.cartonId, cartones.id))
    .leftJoin(compradores, eq(ventas.compradorId, compradores.id))
    .orderBy(asc(premiosSorteo.orden));

  const provincias = PROVINCIAS.map((p) => {
    const row = porProvincia.find((x) => x.provincia === p);
    const tot = cartonPorProv.find((x) => x.provincia === p);
    const vendidos = Number(row?.vendidos ?? 0);
    const total = Number(tot?.total ?? 0);
    return {
      provincia: p,
      vendidos,
      recaudacion: toNumber(row?.recaudacion),
      total,
      avance: total > 0 ? Math.round((vendidos / total) * 100) : 0,
    };
  });

  const vendidos = Number(ventaAgg?.vendidos ?? 0);
  const totalCartones = Number(cartonAgg?.total ?? 0);

  return {
    recaudacion: toNumber(ventaAgg?.recaudacion),
    potencial: toNumber(cartonAgg?.potencial),
    vendidos,
    totalCartones,
    avance: totalCartones > 0 ? Math.round((vendidos / totalCartones) * 1000) / 10 : 0,
    asignados: Number(cartonAgg?.asignados ?? 0),
    disponibles: Number(cartonAgg?.disponibles ?? 0),
    vendedoresActivos: Number(vendAgg?.activos ?? 0),
    vendedoresTotal: Number(vendAgg?.total ?? 0),
    padron: Number(padron?.total ?? 0),
    provincias,
    topVendedores: topVendedores.map((t) => ({
      ...t,
      cartones: Number(t.cartones),
      recaudacion: toNumber(t.recaudacion),
    })),
    premios,
  };
}

export async function lookupCarton(numero: number) {
  const [row] = await db
    .select({
      carton: cartones,
      vendedorNombre: vendedores.nombreCompleto,
      vendedorCodigo: vendedores.codigoVendedor,
      localidadNombre: localidades.nombre,
      provincia: localidades.provincia,
      ventaId: ventas.id,
      recibo: ventas.codigoRecibo,
      fechaVenta: ventas.fechaVenta,
      monto: ventas.monto,
      metodoPago: ventas.metodoPago,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
      telefono: compradores.telefono,
      email: compradores.email,
      direccion: compradores.direccion,
    })
    .from(cartones)
    .leftJoin(vendedores, eq(cartones.vendedorId, vendedores.id))
    .leftJoin(localidades, eq(cartones.localidadId, localidades.id))
    .leftJoin(ventas, eq(ventas.cartonId, cartones.id))
    .leftJoin(compradores, eq(ventas.compradorId, compradores.id))
    .where(eq(cartones.numeroCarton, numero))
    .limit(1);
  return row ?? null;
}

export async function lookupDni(dni: string) {
  const [row] = await db
    .select()
    .from(compradores)
    .where(eq(compradores.dni, dni))
    .limit(1);
  return row ?? null;
}

export async function buscarSorteo(q: string) {
  const trimmed = q.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length >= 7 && digits.length <= 9) {
    const [venta] = await db
      .select({ numero: cartones.numeroCarton })
      .from(ventas)
      .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
      .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
      .where(eq(compradores.dni, digits))
      .orderBy(desc(ventas.fechaVenta))
      .limit(1);
    if (venta) return lookupCarton(venta.numero);
  }
  const numero = Number(digits);
  if (Number.isFinite(numero) && numero > 0) return lookupCarton(numero);
  return null;
}

export async function listVentas(session: SessionUser, opts: { q?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = 20;
  const ventaScope = scopeVentas(session);
  const q = opts.q?.trim();
  const search = q
    ? sql`(
        ${compradores.nombreCompleto} ilike ${"%" + q.toUpperCase() + "%"}
        or ${compradores.dni} like ${"%" + q + "%"}
        or ${ventas.codigoRecibo} ilike ${"%" + q + "%"}
        or cast(${cartones.numeroCarton} as text) like ${"%" + q + "%"}
      )`
    : undefined;

  const where = combine(ventaScope, search);
  const [agg] = await db
    .select({ total: count(ventas.id) })
    .from(ventas)
    .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
    .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
    .where(where);

  const rows = await db
    .select({
      id: ventas.id,
      recibo: ventas.codigoRecibo,
      fecha: ventas.fechaVenta,
      monto: ventas.monto,
      metodo: ventas.metodoPago,
      numeroCarton: cartones.numeroCarton,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
      vendedor: vendedores.nombreCompleto,
      codigoVendedor: vendedores.codigoVendedor,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
    })
    .from(ventas)
    .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
    .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
    .innerJoin(vendedores, eq(ventas.vendedorId, vendedores.id))
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(where)
    .orderBy(desc(ventas.fechaVenta), desc(ventas.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { rows, total: Number(agg?.total ?? 0), page, pageSize };
}

export async function getVentaTicket(id: number) {
  const [row] = await db
    .select({
      venta: ventas,
      carton: cartones,
      comprador: compradores,
      vendedor: vendedores,
      localidad: localidades,
    })
    .from(ventas)
    .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
    .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
    .innerJoin(vendedores, eq(ventas.vendedorId, vendedores.id))
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(eq(ventas.id, id))
    .limit(1);
  return row ?? null;
}

export async function listCartones(
  session: SessionUser,
  opts: {
    estado?: string;
    localidadId?: number;
    vendedorId?: number;
    numero?: string;
    page?: number;
  },
) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = 25;
  const filters = [
    scopeCartones(session),
    opts.estado
      ? eq(
          cartones.estado,
          opts.estado as "disponible" | "asignado" | "vendido" | "anulado" | "devuelto",
        )
      : undefined,
    opts.localidadId ? eq(cartones.localidadId, opts.localidadId) : undefined,
    opts.vendedorId ? eq(cartones.vendedorId, opts.vendedorId) : undefined,
    opts.numero ? eq(cartones.numeroCarton, Number(opts.numero)) : undefined,
  ];
  const where = combine(...filters);

  const [agg] = await db.select({ total: count(cartones.id) }).from(cartones).where(where);

  const rows = await db
    .select({
      carton: cartones,
      vendedor: vendedores.nombreCompleto,
      codigoVendedor: vendedores.codigoVendedor,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
      ventaId: ventas.id,
    })
    .from(cartones)
    .leftJoin(vendedores, eq(cartones.vendedorId, vendedores.id))
    .leftJoin(localidades, eq(cartones.localidadId, localidades.id))
    .leftJoin(ventas, eq(ventas.cartonId, cartones.id))
    .leftJoin(compradores, eq(ventas.compradorId, compradores.id))
    .where(where)
    .orderBy(asc(cartones.numeroCarton))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { rows, total: Number(agg?.total ?? 0), page, pageSize };
}

export async function listLocalidades(session: SessionUser) {
  const locFilter =
    session.role === "referente" && session.localidadId
      ? eq(localidades.id, session.localidadId)
      : undefined;

  const rows = await db
    .select({
      localidad: localidades,
      vendidos: sql<number>`count(${ventas.id})`,
      recaudacion: sql<number>`coalesce(sum(${ventas.monto}::numeric), 0)`,
      cartones: sql<number>`(select count(*) from cartones c where c.localidad_id = ${localidades.id})`,
    })
    .from(localidades)
    .leftJoin(ventas, eq(ventas.localidadId, localidades.id))
    .where(locFilter)
    .groupBy(localidades.id)
    .orderBy(asc(localidades.provincia), asc(localidades.nombre));

  return rows.map((r) => ({
    ...r.localidad,
    vendidos: Number(r.vendidos),
    recaudacion: toNumber(r.recaudacion),
    cartones: Number(r.cartones),
  }));
}

export async function listVendedores(session: SessionUser) {
  const filter =
    session.role === "referente" && session.localidadId
      ? eq(vendedores.localidadId, session.localidadId)
      : session.role === "vendedor" && session.vendedorId
        ? eq(vendedores.id, session.vendedorId)
        : undefined;

  const rows = await db
    .select({
      vendedor: vendedores,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      vendidos: sql<number>`count(${ventas.id})`,
      recaudado: sql<number>`coalesce(sum(${ventas.monto}::numeric), 0)`,
      stock: sql<number>`(select count(*) from cartones c where c.vendedor_id = ${vendedores.id} and c.estado in ('asignado','vendido','devuelto'))`,
      disponiblesAsignados: sql<number>`(select count(*) from cartones c where c.vendedor_id = ${vendedores.id} and c.estado = 'asignado')`,
    })
    .from(vendedores)
    .innerJoin(localidades, eq(vendedores.localidadId, localidades.id))
    .leftJoin(ventas, eq(ventas.vendedorId, vendedores.id))
    .where(filter)
    .groupBy(vendedores.id, localidades.nombre, localidades.provincia)
    .orderBy(asc(vendedores.codigoVendedor));

  return rows.map((r) => {
    const recaudado = toNumber(r.recaudado);
    const comision = Number(r.vendedor.comisionPorcentaje);
    return {
      ...r.vendedor,
      localidad: r.localidad,
      provincia: r.provincia,
      vendidos: Number(r.vendidos),
      recaudado,
      stock: Number(r.stock),
      disponiblesAsignados: Number(r.disponiblesAsignados),
      comisionDevengada: Math.round(recaudado * (comision / 100) * 100) / 100,
    };
  });
}

export async function listCompradores(session: SessionUser, q?: string) {
  const search = q?.trim()
    ? sql`(${compradores.nombreCompleto} ilike ${"%" + q.toUpperCase() + "%"} or ${compradores.dni} like ${"%" + q + "%"})`
    : undefined;

  const scopedJoin =
    session.role === "vendedor" && session.vendedorId
      ? eq(ventas.vendedorId, session.vendedorId)
      : session.role === "referente" && session.localidadId
        ? eq(ventas.localidadId, session.localidadId)
        : undefined;

  const rows = await db
    .select({
      comprador: compradores,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      cartones: count(ventas.id),
      invertido: sum(ventas.monto),
    })
    .from(compradores)
    .leftJoin(localidades, eq(compradores.localidadId, localidades.id))
    .leftJoin(ventas, eq(ventas.compradorId, compradores.id))
    .where(combine(search, scopedJoin))
    .groupBy(compradores.id, localidades.nombre, localidades.provincia)
    .orderBy(asc(compradores.nombreCompleto));

  return rows.map((r) => ({
    ...r.comprador,
    localidad: r.localidad,
    provincia: r.provincia,
    cartones: Number(r.cartones),
    invertido: toNumber(r.invertido),
  }));
}

export async function listRendiciones(session: SessionUser) {
  const filter =
    session.role === "referente" && session.localidadId
      ? eq(rendiciones.localidadId, session.localidadId)
      : session.role === "vendedor" && session.vendedorId
        ? eq(rendiciones.vendedorId, session.vendedorId)
        : undefined;

  return db
    .select({
      rendicion: rendiciones,
      vendedor: vendedores.nombreCompleto,
      codigo: vendedores.codigoVendedor,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
    })
    .from(rendiciones)
    .innerJoin(vendedores, eq(rendiciones.vendedorId, vendedores.id))
    .innerJoin(localidades, eq(rendiciones.localidadId, localidades.id))
    .where(filter)
    .orderBy(desc(rendiciones.fechaRendicion));
}

export async function vendedorEstadoCaja(vendedorId: number) {
  const [vend] = await db
    .select({
      vendedor: vendedores,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
    })
    .from(vendedores)
    .innerJoin(localidades, eq(vendedores.localidadId, localidades.id))
    .where(eq(vendedores.id, vendedorId))
    .limit(1);
  if (!vend) return null;

  const [c] = await db
    .select({
      entregados: sql<number>`count(*) filter (where ${cartones.estado} in ('asignado','vendido','devuelto'))`,
      vendidos: sql<number>`count(*) filter (where ${cartones.estado} = 'vendido')`,
      devueltos: sql<number>`count(*) filter (where ${cartones.estado} = 'devuelto')`,
    })
    .from(cartones)
    .where(eq(cartones.vendedorId, vendedorId));

  const [v] = await db
    .select({ bruto: sum(ventas.monto), cant: count(ventas.id) })
    .from(ventas)
    .where(eq(ventas.vendedorId, vendedorId));

  const bruto = toNumber(v?.bruto);
  const comisionPct = Number(vend.vendedor.comisionPorcentaje);
  const comision = Math.round(bruto * (comisionPct / 100) * 100) / 100;
  return {
    ...vend,
    entregados: Number(c?.entregados ?? 0),
    vendidos: Number(c?.vendidos ?? 0),
    devueltos: Number(c?.devueltos ?? 0),
    bruto,
    comision,
    aRendir: Math.round((bruto - comision) * 100) / 100,
  };
}

export async function padronOficial(session: SessionUser) {
  const ventaScope = scopeVentas(session);
  const rows = await db
    .select({
      recibo: ventas.codigoRecibo,
      numeroCarton: cartones.numeroCarton,
      serie: cartones.serie,
      talonario: cartones.talonario,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
      telefono: compradores.telefono,
      email: compradores.email,
      domicilio: compradores.direccion,
      vendedor: vendedores.nombreCompleto,
      codigoVendedor: vendedores.codigoVendedor,
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      fechaVenta: ventas.fechaVenta,
      monto: ventas.monto,
      metodo: ventas.metodoPago,
      comprobante: ventas.comprobantePago,
      ventaId: ventas.id,
    })
    .from(ventas)
    .innerJoin(cartones, eq(ventas.cartonId, cartones.id))
    .innerJoin(compradores, eq(ventas.compradorId, compradores.id))
    .innerJoin(vendedores, eq(ventas.vendedorId, vendedores.id))
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(ventaScope)
    .orderBy(asc(cartones.numeroCarton));

  const resumen = await db
    .select({
      localidad: localidades.nombre,
      provincia: localidades.provincia,
      cartones: count(ventas.id),
      recaudacion: sum(ventas.monto),
    })
    .from(ventas)
    .innerJoin(localidades, eq(ventas.localidadId, localidades.id))
    .where(ventaScope)
    .groupBy(localidades.nombre, localidades.provincia)
    .orderBy(asc(localidades.provincia), asc(localidades.nombre));

  return { rows, resumen };
}

export async function listPremios() {
  return db
    .select({
      premio: premiosSorteo,
      numeroCarton: cartones.numeroCarton,
      titular: compradores.nombreCompleto,
      dni: compradores.dni,
    })
    .from(premiosSorteo)
    .leftJoin(cartones, eq(premiosSorteo.cartonGanadorId, cartones.id))
    .leftJoin(ventas, eq(ventas.cartonId, cartones.id))
    .leftJoin(compradores, eq(ventas.compradorId, compradores.id))
    .orderBy(asc(premiosSorteo.orden));
}

export async function selectsCatalog(session: SessionUser) {
  const locFilter =
    session.role === "referente" && session.localidadId
      ? eq(localidades.id, session.localidadId)
      : undefined;
  const vendFilter =
    session.role === "vendedor" && session.vendedorId
      ? eq(vendedores.id, session.vendedorId)
      : session.role === "referente" && session.localidadId
        ? eq(vendedores.localidadId, session.localidadId)
        : undefined;

  const locs = await db
    .select()
    .from(localidades)
    .where(locFilter)
    .orderBy(asc(localidades.nombre));
  const vends = await db
    .select()
    .from(vendedores)
    .where(vendFilter)
    .orderBy(asc(vendedores.codigoVendedor));
  return { localidades: locs, vendedores: vends };
}

export async function listBolillas() {
  const { sorteoBolillas } = await import("@/db/schema");
  return db.select().from(sorteoBolillas).orderBy(asc(sorteoBolillas.orden));
}

export { and, eq, gte, lte };
