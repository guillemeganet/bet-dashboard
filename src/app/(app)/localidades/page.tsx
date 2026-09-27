import { requireRole } from "@/lib/auth";
import { listLocalidades } from "@/lib/queries";
import { crearLocalidad, eliminarLocalidad } from "@/app/actions";
import { money, num } from "@/lib/format";
import { PROVINCIAS } from "@/lib/constants";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function LocalidadesPage() {
  const session = await requireRole(["admin", "referente"]);
  const rows = await listLocalidades(session);

  return (
    <div>
      <h1 className="font-display text-3xl gold-text">Localidades / sedes</h1>
      {session.role === "admin" && (
        <form
          action={async (fd) => {
            "use server";
            await crearLocalidad(fd);
          }}
          className="panel mt-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-3"
        >
          <input name="nombre" required placeholder="Nombre" className="rounded-xl px-3 py-2" />
          <select name="provincia" className="rounded-xl px-3 py-2" defaultValue="Chaco">
            {PROVINCIAS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input name="departamentoZona" required placeholder="Departamento / zona" className="rounded-xl px-3 py-2" />
          <input name="referenteLocal" placeholder="Referente" className="rounded-xl px-3 py-2" />
          <input name="telefonoReferente" placeholder="Teléfono referente" className="rounded-xl px-3 py-2" />
          <button className="gold-btn rounded-xl text-xs" type="submit">
            Alta de sede
          </button>
        </form>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((l) => (
          <article key={l.id} className="panel rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300">{l.provincia}</p>
            <h2 className="font-display text-2xl text-amber-50">{l.nombre}</h2>
            <p className="text-sm text-slate-300">{l.departamentoZona}</p>
            <p className="mt-2 text-sm">
              Referente: {l.referenteLocal ?? "—"} · {l.telefonoReferente ?? ""}
            </p>
            <p className="mt-3 text-yellow-300">{num(l.vendidos)} vendidos · {money(l.recaudacion)}</p>
            {session.role === "admin" && (
              <div className="mt-3">
                <DeleteButton
                  label="Eliminar sede"
                  confirm="¿Eliminar localidad? Se bloqueará si tiene cartones."
                  action={eliminarLocalidad.bind(null, l.id)}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
