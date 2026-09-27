import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getVentaTicket } from "@/lib/queries";
import { TicketView } from "@/components/TicketView";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const row = await getVentaTicket(Number(id));
  if (!row) notFound();

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Link href="/ventas" className="rounded-xl border border-amber-400/30 px-4 py-2 text-xs uppercase text-amber-100">
          Volver
        </Link>
      </div>
      <TicketView
        venta={row.venta}
        carton={row.carton}
        comprador={row.comprador}
        vendedor={row.vendedor}
        localidad={row.localidad}
      />
    </div>
  );
}
