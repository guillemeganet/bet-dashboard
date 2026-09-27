import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buscarSorteo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json({ found: false });
  const row = await buscarSorteo(q);
  if (!row) return NextResponse.json({ found: false });
  const habilitado = row.carton.estado === "vendido";
  return NextResponse.json({
    found: true,
    habilitado,
    carton: row.carton,
    titular: row.titular,
    dni: row.dni,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    localidad: row.localidadNombre,
    provincia: row.provincia,
    vendedor: row.vendedorNombre,
    vendedorCodigo: row.vendedorCodigo,
    recibo: row.recibo,
    fechaVenta: row.fechaVenta,
    monto: row.monto,
    metodoPago: row.metodoPago,
    ventaId: row.ventaId,
  });
}
