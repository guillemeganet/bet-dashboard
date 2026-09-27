import { and, eq, SQL } from "drizzle-orm";
import type { SessionUser } from "./auth";
import { cartones, ventas } from "@/db/schema";

export function scopeVentas(session: SessionUser): SQL | undefined {
  if (session.role === "admin" || session.role === "escribano") return undefined;
  if (session.role === "referente" && session.localidadId) {
    return eq(ventas.localidadId, session.localidadId);
  }
  if (session.role === "vendedor" && session.vendedorId) {
    return eq(ventas.vendedorId, session.vendedorId);
  }
  return eq(ventas.id, -1);
}

export function scopeCartones(session: SessionUser): SQL | undefined {
  if (session.role === "admin" || session.role === "escribano") return undefined;
  if (session.role === "referente" && session.localidadId) {
    return eq(cartones.localidadId, session.localidadId);
  }
  if (session.role === "vendedor" && session.vendedorId) {
    return eq(cartones.vendedorId, session.vendedorId);
  }
  return eq(cartones.id, -1);
}

export function combine(...clauses: (SQL | undefined)[]) {
  const list = clauses.filter((c): c is SQL => Boolean(c));
  if (!list.length) return undefined;
  if (list.length === 1) return list[0];
  return and(...list);
}

export function canMutateSales(session: SessionUser) {
  return ["admin", "referente", "vendedor"].includes(session.role);
}

export function canManageLots(session: SessionUser) {
  return session.role === "admin";
}

export function canSorteo(session: SessionUser) {
  return session.role === "admin" || session.role === "escribano";
}

export function canExport(session: SessionUser) {
  return ["admin", "referente", "escribano"].includes(session.role);
}

export function canManageCatalog(session: SessionUser) {
  return session.role === "admin" || session.role === "referente";
}
