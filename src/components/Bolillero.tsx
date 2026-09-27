"use client";

import { useMemo, useState } from "react";

type Bolilla = { id: number; numero: number; orden: number };

export function Bolillero({ initial }: { initial: Bolilla[] }) {
  const [extraidas, setExtraidas] = useState(initial);
  const [actual, setActual] = useState<number | null>(initial.at(-1)?.numero ?? null);
  const [spinning, setSpinning] = useState(false);
  const [voz, setVoz] = useState(true);
  const [error, setError] = useState("");

  const taken = useMemo(() => extraidas.map((b) => b.numero), [extraidas]);
  const remaining = 90 - extraidas.length;
  const last8 = extraidas.slice(-8).reverse();

  function speak(n: number) {
    if (!voz || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`Bolilla ${n}`);
    u.lang = "es-AR";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  }

  async function extraer() {
    if (spinning || remaining <= 0) return;
    setSpinning(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1100));
    try {
      const res = await fetch("/api/bolillas", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo extraer");
        return;
      }
      if (data.done) {
        setError("Ya se extrajeron las 90 bolillas");
        return;
      }
      setExtraidas((prev) => [...prev, data.bolilla]);
      setActual(data.bolilla.numero);
      speak(data.bolilla.numero);
    } finally {
      setSpinning(false);
    }
  }

  async function reiniciar() {
    if (!confirm("¿Reiniciar el bolillero? Se borrarán todas las bolillas extraídas de esta mesa.")) return;
    const res = await fetch("/api/bolillas", { method: "DELETE" });
    if (res.ok) {
      setExtraidas([]);
      setActual(null);
    }
  }

  return (
    <section className="panel rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300">Bolillero oficial 1–90</p>
          <h2 className="font-display text-2xl gold-text">Mesa de extracción</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVoz((v) => !v)}
            className="rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-bold uppercase text-amber-100"
          >
            Voz {voz ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-lg border border-red-400/40 px-3 py-2 text-xs font-bold uppercase text-red-200"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[220px_1fr]">
        <div className="grid place-items-center">
          <div
            className={`grid h-40 w-40 place-items-center rounded-full border-4 border-amber-400 bg-[radial-gradient(circle_at_30%_30%,#fff7d1,#d4af37_45%,#7c2d12)] font-display text-6xl font-black text-slate-950 ${spinning ? "spin-ball" : ""}`}
          >
            {spinning ? "?" : actual ?? "—"}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-amber-200">
            Extraídas {extraidas.length} · Restan {remaining}
          </p>
          <button className="gold-btn mt-3 w-full rounded-xl px-4 py-3 text-xs" type="button" onClick={extraer} disabled={spinning}>
            Extraer siguiente bolilla
          </button>
        </div>
        <div>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => (
              <div key={n} className={`ball ${taken.includes(n) ? "on" : ""}`}>
                {n}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">Últimas 8 bolillas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {last8.map((b) => (
                <span
                  key={b.id}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-yellow-200 to-amber-700 font-display text-sm font-black text-slate-950"
                >
                  {b.numero}
                </span>
              ))}
              {!last8.length && <span className="text-sm text-slate-400">Todavía no se extrajo ninguna bolilla.</span>}
            </div>
          </div>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
    </section>
  );
}
