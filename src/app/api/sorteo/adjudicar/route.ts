import { NextResponse } from "next/server";
import { db } from "@/db";
import { cartones, premiosSorteo, ventas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { canSorteo } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  if (!canSorteo(session)) {
    return NextResponse.json({ message: "Solo escribanía o administración pueden adjudicar" }, { status: 403 });
  }
  const body = (await request.json()) as {
    cartonId?: number;
    premioId?: number;
    notas?: string;
  };
  if (!body.cartonId || !body.premioId) {
    return NextResponse.json({ message: "Falta cartón o premio" }, { status: 422 });
  }

  const [carton] = await db.select().from(cartones).where(eq(cartones.id, body.cartonId)).limit(1);
  if (!carton) return NextResponse.json({ message: "Cartón inexistente" }, { status: 404 });
  if (carton.estado !== "vendido") {
    return NextResponse.json(
      {
        message:
          "BLOQUEO NOTARIAL: no se puede adjudicar un premio a un cartón NO VENDIDO. El cartón no está habilitado para jugar.",
      },
      { status: 409 },
    );
  }
  const [venta] = await db.select().from(ventas).where(eq(ventas.cartonId, carton.id)).limit(1);
  if (!venta) {
    return NextResponse.json(
      { message: "BLOQUEO NOTARIAL: el cartón no tiene venta registrada. No habilitado." },
      { status: 409 },
    );
  }

  const [premio] = await db
    .update(premiosSorteo)
    .set({
      cartonGanadorId: carton.id,
      horaGanado: new Date(),
      estado: "validado",
      notasEscribano: body.notas?.trim() || `Validado por ${session.name}`,
      updatedAt: new Date(),
    })
    .where(eq(premiosSorteo.id, body.premioId))
    .returning();

  if (!premio) return NextResponse.json({ message: "Premio inexistente" }, { status: 404 });
  return NextResponse.json({ ok: true, premio });
}
