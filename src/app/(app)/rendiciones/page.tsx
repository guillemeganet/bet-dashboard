import { requireRole } from "@/lib/auth";
import { listRendiciones, selectsCatalog } from "@/lib/queries";
import { money, formatDate, num } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { RendicionForm } from "@/components/RendicionForm";

export const dynamic = "force-dynamic";

export default async function RendicionesPage() {
  const session = await requireRole(["admin", "referente"]);
  const rows = await listRendiciones(session);
  const catalog = await selectsCatalog(session);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl gold-text">Rendiciones</h1>
          <p className="text-sm text-amber-100/70">
            Total a rendir = bruto − comisión · Diferencia = rendido − a rendir
          </p>
        </div>
        <RendicionForm vendedores={catalog.vendedores} />
      </div>
      <div className="table-wrap panel mt-4 rounded-2xl">
        <table className="data">
          <thead>
            <tr>
              <th>Código / fecha</th>
              <th>Vendedor + sede</th>
              <th>Entregados</th>
              <th>Vendidos</th>
              <th>Devueltos</th>
              <th>Bruto</th>
              <th>Comisión</th>
              <th>Rendido</th>
              <th>Dif.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rendicion.id}>
                <td>
                  <div className="font-mono text-amber-200">{r.rendicion.codigoRendicion}</div>
                  <div className="text-[11px] text-slate-400">{formatDate(r.rendicion.fechaRendicion)}</div>
                </td>
                <td>
                  {r.codigo} · {r.vendedor}
                  <div className="text-[11px] text-slate-400">
                    {r.localidad} · {r.provincia}
                  </div>
                </td>
                <td>{num(r.rendicion.cartonesEntregados)}</td>
                <td>{num(r.rendicion.cartonesVendidos)}</td>
                <td>{num(r.rendicion.cartonesDevueltos)}</td>
                <td>{money(r.rendicion.totalBruto)}</td>
                <td>{money(r.rendicion.comisionRetenida)}</td>
                <td>{money(r.rendicion.totalRendido)}</td>
                <td>{money(r.rendicion.diferencia)}</td>
                <td>
                  <StatusBadge estado={r.rendicion.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
