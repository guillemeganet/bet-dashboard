import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listCartones, selectsCatalog } from "@/lib/queries";
import { cartonCode, money } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { LotesPanel } from "@/components/LotesPanel";
import { canManageLots } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function CartonesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; localidadId?: string; vendedorId?: string; numero?: string; page?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const catalog = await selectsCatalog(session);
  const data = await listCartones(session, {
    estado: sp.estado,
    localidadId: sp.localidadId ? Number(sp.localidadId) : undefined,
    vendedorId: sp.vendedorId ? Number(sp.vendedorId) : undefined,
    numero: sp.numero,
    page: Number(sp.page || 1),
  });
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl gold-text">Cartones y lotes</h1>
          <p className="text-sm text-amber-100/70">{data.total} cartones en el filtro actual</p>
        </div>
        {canManageLots(session) && <LotesPanel vendedores={catalog.vendedores} />}
      </div>

      <form className="panel mt-4 grid gap-2 rounded-2xl p-4 sm:grid-cols-5">
        <input name="numero" defaultValue={sp.numero} placeholder="N° cartón" className="rounded-xl px-3 py-2" />
        <select name="estado" defaultValue={sp.estado ?? ""} className="rounded-xl px-3 py-2">
          <option value="">Todos los estados</option>
          {["disponible", "asignado", "vendido", "anulado", "devuelto"].map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select name="localidadId" defaultValue={sp.localidadId ?? ""} className="rounded-xl px-3 py-2">
          <option value="">Todas las sedes</option>
          {catalog.localidades.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
        <select name="vendedorId" defaultValue={sp.vendedorId ?? ""} className="rounded-xl px-3 py-2">
          <option value="">Todos los vendedores</option>
          {catalog.vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.codigoVendedor}
            </option>
          ))}
        </select>
        <button className="gold-btn rounded-xl text-xs" type="submit">
          Filtrar
        </button>
      </form>

      <div className="table-wrap panel mt-4 rounded-2xl">
        <table className="data">
          <thead>
            <tr>
              <th>N° cartón</th>
              <th>Serie / talonario</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Vendedor</th>
              <th>Localidad</th>
              <th>Titular</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.carton.id}>
                <td className="font-display">{cartonCode(r.carton.numeroCarton)}</td>
                <td>
                  {r.carton.serie}
                  <div className="text-[11px] text-slate-400">{r.carton.talonario}</div>
                </td>
                <td>
                  <StatusBadge estado={r.carton.estado} />
                </td>
                <td>{money(r.carton.precio)}</td>
                <td>{r.codigoVendedor ?? "—"}</td>
                <td>{r.localidad ?? "Depósito"}</td>
                <td>
                  {r.titular ?? "—"}
                  {r.dni && <div className="text-[11px] text-slate-400">DNI {r.dni}</div>}
                </td>
                <td>
                  {r.ventaId ? (
                    <Link href={`/ventas/${r.ventaId}/ticket`} className="text-xs font-bold uppercase text-yellow-300">
                      Ver ticket
                    </Link>
                  ) : r.carton.estado === "disponible" || r.carton.estado === "asignado" ? (
                    <Link
                      href={`/ventas/nueva?carton=${r.carton.numeroCarton}`}
                      className="text-xs font-bold uppercase text-emerald-300"
                    >
                      Vender
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Página {data.page} / {pages}
      </p>
    </div>
  );
}
