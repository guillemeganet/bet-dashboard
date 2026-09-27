import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookieOptions, createToken, verifyPassword } from "@/lib/session-token";
import { COOKIE_NAME } from "@/lib/constants";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as { email?: string; password?: string };
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ message: "Ingresá email y contraseña" }, { status: 422 });
  }
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
  }
  const token = createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    localidadId: user.localidadId,
    vendedorId: user.vendedorId,
  });
  const res = NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(COOKIE_NAME, token, cookieOptions);
  return res;
}
