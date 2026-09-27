import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listVentas } from "@/lib/queries";
import { cartonCode, formatDate, money, metodoLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const data = await listVentas(session, { q: sp.q, page: Number(sp.page || 1) });
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl gold-text">Ventas</h1>
          <p className="text-sm text-amber-100/70">{data.total} recibos en tu alcance</p>
        </div>
        {session.role !== "escribano" && (
          <Link href="/ventas/nueva" className="gold-btn rounded-xl px-4 py-2 text-xs">
            Nueva venta
          </Link>
        )}
      </div>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar por cartón, DNI, titular o recibo"
          className="w-full max-w-lg rounded-xl px-4 py-3"
        />
      </form>
      <div className="table-wrap panel mt-4 rounded-2xl">
        <table className="data">
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Cartón</th>
              <th>Titular</th>
              <th>DNI</th>
              <th>Vendedor</th>
              <th>Localidad</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-amber-200">{r.recibo}</td>
                <td className="font-display">{cartonCode(r.numeroCarton)}</td>
                <td>{r.titular}</td>
                <td>{r.dni}</td>
                <td>
                  {r.codigoVendedor}
                  <div className="text-[11px] text-slate-400">{r.vendedor}</div>
                </td>
                <td>
                  {r.localidad}
                  <div className="text-[11px] text-slate-400">{r.provincia}</div>
                </td>
                <td>{formatDate(r.fecha)}</td>
                <td>
                  {money(r.monto)}
                  <div className="text-[11px] text-slate-400">{metodoLabel(r.metodo)}</div>
                </td>
                <td>
                  <Link href={`/ventas/${r.id}/ticket`} className="text-xs font-bold uppercase text-yellow-300">
                    Ticket
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2 text-sm">
        {data.page > 1 && (
          <Link href={`/ventas?q=${sp.q ?? ""}&page=${data.page - 1}`} className="text-amber-200">
            ← Anterior
          </Link>
        )}
        <span className="text-slate-400">
          Página {data.page} / {pages}
        </span>
        {data.page < pages && (
          <Link href={`/ventas?q=${sp.q ?? ""}&page=${data.page + 1}`} className="text-amber-200">
            Siguiente →
          </Link>
        )}
      </div>
    </div>
  );
}
