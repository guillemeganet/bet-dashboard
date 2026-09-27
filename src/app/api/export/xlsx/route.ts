import { getSession } from "@/lib/auth";
import { canExport } from "@/lib/scope";
import { padronOficial } from "@/lib/queries";
import { buildXlsx } from "@/lib/export-padron";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("No autenticado", { status: 401 });
  if (!canExport(session)) return new Response("Sin permiso", { status: 403 });
  const padron = await padronOficial(session);
  const buf = await buildXlsx(padron);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="BingoDoradoNEA-2026-PadronOficial.xlsx"',
    },
  });
}
