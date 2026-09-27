import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Role } from "@/db/schema";

export type SessionUser = {
  userId: number;
  email: string;
  name: string;
  role: Role;
  localidadId: number | null;
  vendedorId: number | null;
  exp: number;
};

const SECRET = process.env.AUTH_SECRET || "bingo-dorado-nea-2026-hostinger-key";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const supplied = scryptSync(password, salt, 64);
  if (hashBuffer.length !== supplied.length) return false;
  return timingSafeEqual(hashBuffer, supplied);
}

export function createToken(user: Omit<SessionUser, "exp">) {
  const payload: SessionUser = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined | null): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (!payload?.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};
