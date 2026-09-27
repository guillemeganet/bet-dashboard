import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canMutateSales } from "@/lib/scope";
import { registrarVenta } from "@/lib/ventas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  if (!canMutateSales(session)) {
    return NextResponse.json({ message: "Sin permiso para registrar ventas" }, { status: 403 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  const numeroCarton = Number(body.numeroCarton);
  const vendedorId = Number(body.vendedorId);
  const localidadId = Number(body.localidadId);
  const result = await registrarVenta(
    {
      numeroCarton,
      dni: String(body.dni ?? ""),
      nombreCompleto: String(body.nombreCompleto ?? ""),
      telefono: body.telefono ? String(body.telefono) : undefined,
      email: body.email ? String(body.email) : undefined,
      direccion: body.direccion ? String(body.direccion) : undefined,
      vendedorId,
      localidadId,
      metodoPago: String(body.metodoPago ?? ""),
      monto: body.monto ? Number(body.monto) : undefined,
      comprobantePago: body.comprobantePago ? String(body.comprobantePago) : undefined,
      observaciones: body.observaciones ? String(body.observaciones) : undefined,
    },
    session,
  );
  if (result.error) {
    return NextResponse.json(
      { message: result.error.message, extra: result.error.extra ?? null },
      { status: result.error.status },
    );
  }
  return NextResponse.json({ ok: true, venta: result.venta });
}
