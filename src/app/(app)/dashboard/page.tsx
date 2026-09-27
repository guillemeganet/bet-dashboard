import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getDashboard } from "@/lib/queries";
import { cartonCode, money, num } from "@/lib/format";
import { EDICION, EVENTO } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const d = await getDashboard(session);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300">{EVENTO}</p>
        <h1 className="font-display text-3xl gold-text sm:text-4xl">Dashboard ejecutivo</h1>
        <p className="text-sm text-amber-100/70">{EDICION} · visión provincial en vivo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Recaudación total" value={money(d.recaudacion)} hint={`Potencial ${money(d.potencial)}`} />
        <Kpi
          title="Cartones vendidos"
          value={`${num(d.vendidos)}`}
          hint={`${d.avance}% de avance`}
          bar={d.avance}
        />
        <Kpi
          title="En calle / depósito"
          value={`${num(d.asignados)} / ${num(d.disponibles)}`}
          hint="Asignados en territorio · disponibles en depósito"
        />
        <Kpi
          title="Red comercial"
          value={`${d.vendedoresActivos}/${d.vendedoresTotal}`}
          hint={`Padrón compradores: ${num(d.padron)}`}
        />
      </div>

      <section>
        <h2 className="font-display text-xl gold-text">Distribución por provincia NEA</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {d.provincias.map((p) => (
            <div key={p.provincia} className="panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{p.provincia}</p>
              <p className="mt-1 font-display text-2xl text-amber-50">{num(p.vendidos)} vendidos</p>
              <p className="text-sm text-amber-200">{money(p.recaudacion)}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-gradient-to-r from-yellow-200 to-amber-600" style={{ width: `${p.avance}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{p.avance}% del stock georreferenciado</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel rounded-2xl p-5">
          <h2 className="font-display text-xl gold-text">Top 8 vendedores</h2>
          <ol className="mt-3 space-y-2">
            {d.topVendedores.map((v, i) => (
              <li key={v.id} className="flex items-center gap-3 rounded-xl border border-amber-400/15 px-3 py-2">
                <span className="w-8 text-center text-lg">{medals[i] ?? i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-amber-50">{v.nombre}</p>
                  <p className="text-[11px] uppercase tracking-wide text-amber-300/80">
                    {v.codigo} · {v.localidad}, {v.provincia}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-300">{v.cartones} cartones</p>
                  <p className="text-xs text-slate-300">{money(v.recaudacion)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl gold-text">Premios oficiales</h2>
          {d.premios.map((p) => (
            <article key={p.premio.id} className="panel flex gap-3 overflow-hidden rounded-2xl">
              {p.premio.imagen && (
                <img src={p.premio.imagen} alt="" className="hidden h-28 w-28 object-cover sm:block" />
              )}
              <div className="flex-1 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300">Ronda {p.premio.orden}</span>
                  <StatusBadge estado={p.premio.estado} />
                </div>
                <h3 className="font-display text-lg text-amber-50">{p.premio.nombrePremio}</h3>
                {p.numeroCarton && (
                  <p className="text-xs text-amber-200">
                    Ganador {cartonCode(p.numeroCarton)}
                    {p.titular ? ` · ${p.titular}` : ""}
                    {p.dni ? ` · DNI ${p.dni}` : ""}
                  </p>
                )}
              </div>
            </article>
          ))}
          {session.role !== "vendedor" && (
            <Link href="/sorteo" className="gold-btn inline-flex rounded-xl px-4 py-2 text-xs">
              Ir a mesa de sorteo
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  title,
  value,
  hint,
  bar,
}: {
  title: string;
  value: string;
  hint: string;
  bar?: number;
}) {
  return (
    <div className="panel rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">{title}</p>
      <p className="mt-2 font-display text-2xl text-amber-50 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      {typeof bar === "number" && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-gradient-to-r from-yellow-200 to-amber-600" style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      )}
    </div>
  );
}
