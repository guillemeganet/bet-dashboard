import { requireSession } from "@/lib/auth";
import { listCompradores, selectsCatalog } from "@/lib/queries";
import { crearComprador } from "@/app/actions";
import { money, num } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CompradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const rows = await listCompradores(session, sp.q);
  const catalog = await selectsCatalog(session);

  return (
    <div>
      <h1 className="font-display text-3xl gold-text">Compradores / padrón</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar titular o DNI"
          className="w-full max-w-md rounded-xl px-4 py-3"
        />
      </form>
      {session.role !== "escribano" && (
        <form
          className="panel mt-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-3"
          action={async (fd) => {
            "use server";
            await crearComprador(fd);
          }}
        >
          <input name="nombreCompleto" required placeholder="Nombre completo" className="rounded-xl px-3 py-2 uppercase" />
          <input name="dni" required placeholder="DNI 7-9 dígitos" className="rounded-xl px-3 py-2" />
          <input name="telefono" placeholder="Teléfono" className="rounded-xl px-3 py-2" />
          <input name="email" placeholder="Email" className="rounded-xl px-3 py-2" />
          <input name="direccion" placeholder="Domicilio" className="rounded-xl px-3 py-2" />
          <select name="localidadId" className="rounded-xl px-3 py-2">
            <option value="">Sin sede</option>
            {catalog.localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
          <button className="gold-btn rounded-xl text-xs" type="submit">
            Alta comprador
          </button>
        </form>
      )}
      <div className="table-wrap panel mt-4 rounded-2xl">
        <table className="data">
          <thead>
            <tr>
              <th>Titular</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Localidad / domicilio</th>
              <th>Cartones</th>
              <th>Invertido</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">{c.nombreCompleto}</td>
                <td>{c.dni}</td>
                <td>{c.telefono ?? "—"}</td>
                <td>
                  {c.localidad ?? "—"}
                  <div className="text-[11px] text-slate-400">{c.direccion}</div>
                </td>
                <td>{num(c.cartones)}</td>
                <td>{money(c.invertido)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
