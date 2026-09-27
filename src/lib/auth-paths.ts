import type { Role } from "@/db/schema";
import { NAV_BY_ROLE } from "./constants";

export function navFor(role: Role) {
  return NAV_BY_ROLE[role] ?? NAV_BY_ROLE.vendedor;
}

export function canPath(role: Role, pathname: string) {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/ventas/") && pathname.includes("/ticket")) return true;
  const allowed = navFor(role).some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (allowed) return true;
  if (pathname.startsWith("/ventas") && ["admin", "referente", "vendedor"].includes(role)) {
    return true;
  }
  return false;
}
