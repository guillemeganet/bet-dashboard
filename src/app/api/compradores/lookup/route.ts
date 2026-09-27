import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { lookupDni } from "@/lib/queries";
import { DNI_REGEX } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  const dni = (new URL(request.url).searchParams.get("dni") || "").replace(/\D/g, "");
  if (!DNI_REGEX.test(dni) && dni.length < 7) {
    return NextResponse.json({ found: false });
  }
  const row = await lookupDni(dni);
  if (!row) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, comprador: row });
}
