import { NextResponse } from "next/server";
import { db } from "@/db";
import { sorteoBolillas } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { canSorteo } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const rows = await db.select().from(sorteoBolillas).orderBy(asc(sorteoBolillas.orden));
  return NextResponse.json({ extraidas: rows });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  if (!canSorteo(session)) {
    return NextResponse.json({ message: "Solo mesa de sorteo puede extraer bolillas" }, { status: 403 });
  }

  const result = await db.transaction(async (tx) => {
    const existing = await tx.select().from(sorteoBolillas);
    const taken = new Set(existing.map((b) => b.numero));
    const remaining = [];
    for (let n = 1; n <= 90; n++) if (!taken.has(n)) remaining.push(n);
    if (!remaining.length) return { done: true as const, bolilla: null };
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    const [max] = await tx
      .select({ m: sql<number>`coalesce(max(${sorteoBolillas.orden}), 0)` })
      .from(sorteoBolillas);
    const orden = Number(max?.m ?? 0) + 1;
    const [row] = await tx
      .insert(sorteoBolillas)
      .values({ numero: pick, orden })
      .returning();
    return { done: false as const, bolilla: row };
  });

  return NextResponse.json(result);
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  if (!canSorteo(session)) {
    return NextResponse.json({ message: "Sin permiso" }, { status: 403 });
  }
  await db.execute(sql`truncate table sorteo_bolillas restart identity`);
  return NextResponse.json({ ok: true });
}
