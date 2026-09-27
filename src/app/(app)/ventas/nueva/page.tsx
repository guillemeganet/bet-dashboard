import { requireRole } from "@/lib/auth";
import { selectsCatalog } from "@/lib/queries";
import { PosForm } from "@/components/PosForm";

export const dynamic = "force-dynamic";

export default async function NuevaVentaPage({
  searchParams,
}: {
  searchParams: Promise<{ carton?: string }>;
}) {
  const session = await requireRole(["admin", "referente", "vendedor"]);
  const catalog = await selectsCatalog(session);
  const sp = await searchParams;
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl gold-text">Venta rápida</h1>
      <PosForm
        session={session}
        localidades={catalog.localidades}
        vendedores={catalog.vendedores}
        initialCarton={sp.carton ?? ""}
      />
    </div>
  );
}
