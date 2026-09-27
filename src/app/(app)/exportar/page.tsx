import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { padronOficial } from "@/lib/queries";
import { cartonCode, formatDate, money, metodoLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ExportarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireRole(["admin", "referente", "escribano"]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));
  const pageSize = 25;
  const padron = await padronOficial(session);
  const slice = padron.rows.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(padron.rows.length / pageSize));

  return (
    <div>
      <h1 className="font-display text-3xl gold-text">Exportación oficial</h1>
      <p className="text-sm text-amber-100/70">
        Padrón habilitado para el software de sorteo · XLSX (2 hojas) · CSV con BOM UTF-8 y separador ;
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="/api/export/xlsx" className="gold-btn rounded-xl px-4 py-2 text-xs">
          Descargar Excel (.xlsx)
        </a>
        <a
          href="/api/export/csv"
          className="rounded-xl border border-amber-400/40 px-4 py-2 text-xs font-bold uppercase text-amber-100"
        >
          Descargar CSV
        </a>
        <a
          href="/api/export/json"
          className="rounded-xl border border-amber-400/40 px-4 py-2 text-xs font-bold uppercase text-amber-100"
        >
          JSON / API v1
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {padron.resumen.map((r) => (
          <div key={`${r.provincia}-${r.localidad}`} className="panel rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-300">{r.provincia}</p>
            <p className="font-semibold">{r.localidad}</p>
            <p className="text-sm text-yellow-300">
              {Number(r.cartones)} cartones · {money(r.recaudacion)}
            </p>
          </div>
        ))}
      </div>

      <div className="table-wrap panel mt-5 rounded-2xl">
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
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.ventaId}>
                <td className="font-mono text-amber-200">{r.recibo}</td>
                <td className="font-display">{cartonCode(r.numeroCarton)}</td>
                <td>{r.titular}</td>
                <td>{r.dni}</td>
                <td>{r.codigoVendedor}</td>
                <td>
                  {r.localidad}
                  <div className="text-[11px] text-slate-400">{r.provincia}</div>
                </td>
                <td>{formatDate(r.fechaVenta)}</td>
                <td>
                  {money(r.monto)}
                  <div className="text-[11px] text-slate-400">{metodoLabel(r.metodo)}</div>
                </td>
                <td className="text-[11px] font-bold uppercase text-emerald-300">Habilitado para jugar</td>
                <td>
                  <Link href={`/ventas/${r.ventaId}/ticket`} className="text-xs font-bold uppercase text-yellow-300">
                    Ver ticket
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Página {page} / {pages} · {padron.rows.length} habilitados
      </p>
    </div>
  );
}
