import { getSession } from "@/lib/auth";
import { canExport } from "@/lib/scope";
import { padronOficial } from "@/lib/queries";
import { buildCsv } from "@/lib/export-padron";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("No autenticado", { status: 401 });
  if (!canExport(session)) return new Response("Sin permiso", { status: 403 });
  const padron = await padronOficial(session);
  const csv = buildCsv(padron);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="BingoDoradoNEA-2026-PadronOficial.csv"',
    },
  });
}
