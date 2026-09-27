import { requireRole } from "@/lib/auth";
import { listBolillas, listPremios } from "@/lib/queries";
import { Bolillero } from "@/components/Bolillero";
import { SorteoPanel } from "@/components/SorteoPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { cartonCode, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SorteoPage() {
  await requireRole(["admin", "escribano"]);
  const [premios, bolillas] = await Promise.all([listPremios(), listBolillas()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl gold-text">Mesa de sorteo</h1>
        <p className="text-sm text-amber-100/70">
          Validación cruzada cartón/DNI · bolillero 90 bolillas · actas de escribanía
        </p>
      </div>
      <SorteoPanel premios={premios} />
      <Bolillero initial={bolillas} />
      <section className="panel rounded-2xl p-5">
        <h2 className="font-display text-xl gold-text">Actas y premios</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {premios.map((p) => (
            <article key={p.premio.id} className="rounded-xl border border-amber-400/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-300">Ronda {p.premio.orden}</span>
                <StatusBadge estado={p.premio.estado} />
              </div>
              <h3 className="mt-1 font-display text-lg">{p.premio.nombrePremio}</h3>
              <p className="text-sm text-slate-300">{p.premio.descripcion}</p>
              {p.premio.montoEstimado && (
                <p className="text-sm text-yellow-300">{money(p.premio.montoEstimado)}</p>
              )}
              {p.numeroCarton && (
                <p className="mt-2 text-xs text-amber-100">
                  Ganador {cartonCode(p.numeroCarton)} · {p.titular ?? "—"} · DNI {p.dni ?? "—"}
                </p>
              )}
              {p.premio.notasEscribano && (
                <p className="mt-2 text-xs italic text-slate-400">{p.premio.notasEscribano}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
