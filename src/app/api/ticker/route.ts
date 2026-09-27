import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTickerStats } from "@/lib/queries";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const stats = await getTickerStats(session);
  return NextResponse.json(stats);
}
