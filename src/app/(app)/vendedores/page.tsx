import { requireRole } from "@/lib/auth";
import { listVendedores, selectsCatalog } from "@/lib/queries";
import { crearVendedor, eliminarVendedor, inactivarVendedor } from "@/app/actions";
import { money, num } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const session = await requireRole(["admin", "referente"]);
  const rows = await listVendedores(session);
  const catalog = await selectsCatalog(session);

  return (
    <div>
      <h1 className="font-display text-3xl gold-text">Vendedores</h1>
      <form
        className="panel mt-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-3"
        action={async (fd) => {
          "use server";
          await crearVendedor(fd);
        }}
      >
        <input name="codigoVendedor" required placeholder="VND-CHA-99" className="rounded-xl px-3 py-2" />
        <input name="nombreCompleto" required placeholder="Nombre completo" className="rounded-xl px-3 py-2" />
        <input name="dni" required placeholder="DNI" className="rounded-xl px-3 py-2" />
        <input name="telefono" placeholder="Teléfono" className="rounded-xl px-3 py-2" />
        <input name="email" placeholder="Email" className="rounded-xl px-3 py-2" />
        <select name="localidadId" className="rounded-xl px-3 py-2" required>
          {catalog.localidades.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
        <input name="comisionPorcentaje" defaultValue="15.00" className="rounded-xl px-3 py-2" />
        <button className="gold-btn rounded-xl text-xs" type="submit">
          Alta vendedor
        </button>
      </form>

      <div className="table-wrap panel mt-4 rounded-2xl">
        <table className="data">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre / DNI</th>
              <th>Localidad</th>
              <th>Stock</th>
              <th>Vendidos</th>
              <th>Recaudado</th>
              <th>Comisión</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="font-mono text-amber-200">{v.codigoVendedor}</td>
                <td>
                  {v.nombreCompleto}
                  <div className="text-[11px] text-slate-400">
                    DNI {v.dni} · {v.telefono}
                  </div>
                </td>
                <td>
                  {v.localidad}
                  <div className="text-[11px] text-slate-400">{v.provincia}</div>
                </td>
                <td>{num(v.stock)}</td>
                <td>{num(v.vendidos)}</td>
                <td>{money(v.recaudado)}</td>
                <td>
                  {money(v.comisionDevengada)}
                  <div className="text-[11px] text-slate-400">{v.comisionPorcentaje}%</div>
                </td>
                <td>
                  <StatusBadge estado={v.estado} />
                </td>
                <td className="space-y-1">
                  <form
                    action={async () => {
                      "use server";
                      await inactivarVendedor(v.id);
                    }}
                  >
                    <button className="text-[11px] uppercase text-amber-200" type="submit">
                      Inactivar
                    </button>
                  </form>
                  <DeleteButton
                    label="Eliminar"
                    confirm="Si tiene cartones se bloqueará. ¿Continuar?"
                    action={eliminarVendedor.bind(null, v.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
