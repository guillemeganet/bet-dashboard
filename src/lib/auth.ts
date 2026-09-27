import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, NAV_BY_ROLE } from "./constants";
import type { Role } from "@/db/schema";
import { verifyToken, type SessionUser } from "./session-token";

export type { SessionUser } from "./session-token";
export {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  cookieOptions,
} from "./session-token";

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE_NAME)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect("/dashboard");
  return session;
}

export function navFor(role: Role) {
  return NAV_BY_ROLE[role] ?? NAV_BY_ROLE.vendedor;
}

export function canPath(role: Role, pathname: string) {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/ventas/") && pathname.includes("/ticket")) {
    return true;
  }
  const allowed = navFor(role).some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (allowed) return true;
  if (pathname.startsWith("/ventas") && ["admin", "referente", "vendedor"].includes(role)) {
    return true;
  }
  return false;
}
