import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { vendedorEstadoCaja } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const { id } = await context.params;
  const vendedorId = Number(id);
  const [exists] = await db.select({ id: vendedores.id }).from(vendedores).where(eq(vendedores.id, vendedorId));
  if (!exists) return NextResponse.json({ message: "Vendedor no encontrado" }, { status: 404 });
  const estado = await vendedorEstadoCaja(vendedorId);
  return NextResponse.json(estado);
}
