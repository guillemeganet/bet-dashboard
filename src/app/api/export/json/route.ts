import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canExport } from "@/lib/scope";
import { padronOficial } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  if (!canExport(session)) return NextResponse.json({ message: "Sin permiso" }, { status: 403 });
  const padron = await padronOficial(session);
  return NextResponse.json({
    evento: "BINGO DORADO DEL NEA — Edición Provincial 2026",
    generado: new Date().toISOString(),
    total: padron.rows.length,
    cartones: padron.rows.map((r) => ({
      ...r,
      estado: "HABILITADO PARA JUGAR",
    })),
    resumen: padron.resumen,
  });
}
