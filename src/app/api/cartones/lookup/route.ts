import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { lookupCarton } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const numero = Number(searchParams.get("numero") || "");
  if (!Number.isFinite(numero) || numero <= 0) {
    return NextResponse.json({ message: "Número de cartón inválido" }, { status: 422 });
  }
  const row = await lookupCarton(numero);
  if (!row) return NextResponse.json({ found: false }, { status: 404 });

  const blocked = row.carton.estado === "vendido" || row.carton.estado === "anulado" || row.carton.estado === "devuelto";
  let message = "";
  if (row.carton.estado === "vendido") {
    message = `Cartón ya vendido a ${row.titular ?? "titular"} · DNI ${row.dni ?? "—"} · Recibo ${row.recibo ?? "—"}`;
  } else if (row.carton.estado === "anulado") {
    message = "Cartón ANULADO — no se puede vender";
  } else if (row.carton.estado === "devuelto") {
    message = "Cartón DEVUELTO — no se puede vender";
  }

  return NextResponse.json({
    found: true,
    blocked,
    message,
    carton: {
      id: row.carton.id,
      numeroCarton: row.carton.numeroCarton,
      serie: row.carton.serie,
      talonario: row.carton.talonario,
      precio: row.carton.precio,
      estado: row.carton.estado,
      numerosBingo: row.carton.numerosBingo,
      vendedorNombre: row.vendedorNombre,
      vendedorCodigo: row.vendedorCodigo,
      localidadNombre: row.localidadNombre,
      provincia: row.provincia,
    },
    titular: row.titular
      ? { nombre: row.titular, dni: row.dni, recibo: row.recibo, telefono: row.telefono }
      : null,
  });
}
