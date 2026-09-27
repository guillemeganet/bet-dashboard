"use client";

import { useState } from "react";
import { BingoGrid } from "./BingoGrid";
import { cartonCode, formatDate, money, metodoLabel } from "@/lib/format";

type Premio = {
  premio: {
    id: number;
    orden: number;
    nombrePremio: string;
    estado: string;
    descripcion: string | null;
  };
};

type Resultado = {
  found: boolean;
  habilitado?: boolean;
  carton?: {
    id: number;
    numeroCarton: number;
    estado: string;
    numerosBingo: number[];
    serie: string;
    talonario: string;
  };
  titular?: string | null;
  dni?: string | null;
  telefono?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  vendedor?: string | null;
  recibo?: string | null;
  fechaVenta?: string | null;
  monto?: string | null;
  metodoPago?: string | null;
  ventaId?: number | null;
};

export function SorteoPanel({ premios }: { premios: Premio[] }) {
  const [q, setQ] = useState("100008");
  const [res, setRes] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [premioId, setPremioId] = useState(String(premios[0]?.premio.id ?? ""));
  const [notas, setNotas] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/sorteo/buscar?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setRes(data);
    } finally {
      setLoading(false);
    }
  }

  async function adjudicar() {
    if (!res?.carton) return;
    setMsg(null);
    const r = await fetch("/api/sorteo/adjudicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartonId: res.carton.id,
        premioId: Number(premioId),
        notas,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      setMsg({ ok: false, text: data.message || "No se pudo adjudicar" });
      return;
    }
    setMsg({
      ok: true,
      text: `¡VALIDADO! Cartón ${cartonCode(res.carton.numeroCarton)} adjudicado. Acta notarial registrada.`,
    });
    setModal(false);
  }

  return (
    <section className="panel rounded-2xl p-4 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300">Validación cruzada en vivo</p>
      <h2 className="font-display text-2xl gold-text">Mesa de sorteo / Escribanía</h2>
      <form onSubmit={buscar} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-xl px-4 py-4 font-display text-2xl tracking-wide"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="N° de cartón o DNI"
        />
        <button className="gold-btn rounded-xl px-6 py-4 text-sm" type="submit" disabled={loading}>
          {loading ? "Buscando…" : "Validar ahora"}
        </button>
      </form>

      {res && !res.found && (
        <p className="mt-4 rounded-lg bg-red-950/60 px-4 py-3 font-semibold text-red-100">
          No se encontró cartón ni DNI en el padrón provincial.
        </p>
      )}

      {res?.found && res.carton && (
        <div className={`mt-5 grid gap-4 rounded-2xl border p-4 lg:grid-cols-2 ${res.habilitado ? "border-emerald-400/50 bg-emerald-950/20" : "border-red-400/50 bg-red-950/30"}`}>
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${res.habilitado ? "bg-emerald-500 text-slate-950" : "bg-red-600 text-white"}`}
            >
              {res.habilitado ? "Vendido y habilitado" : "No vendido — no habilitado"}
            </span>
            <p className="mt-3 font-display text-4xl gold-text">{cartonCode(res.carton.numeroCarton)}</p>
            <p className="text-sm text-amber-100">
              {res.carton.serie} · {res.carton.talonario}
            </p>
            <dl className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-amber-300">Titular:</span> {res.titular ?? "—"}{" "}
                <span className="ml-2 rounded bg-amber-400/20 px-2 py-0.5 text-xs">DNI {res.dni ?? "—"}</span>
              </p>
              <p>
                <span className="text-amber-300">Teléfono:</span> {res.telefono ?? "—"}
              </p>
              <p>
                <span className="text-amber-300">Localidad:</span> {res.localidad ?? "—"} · {res.provincia ?? "—"}
              </p>
              <p>
                <span className="text-amber-300">Vendedor:</span> {res.vendedor ?? "—"}
              </p>
              <p>
                <span className="text-amber-300">Recibo:</span> {res.recibo ?? "—"} · {res.fechaVenta ? formatDate(res.fechaVenta) : "—"}
              </p>
              <p>
                <span className="text-amber-300">Monto:</span> {res.monto ? money(res.monto) : "—"} · {res.metodoPago ? metodoLabel(res.metodoPago) : "—"}
              </p>
            </dl>
            <button
              type="button"
              className="gold-btn mt-5 rounded-xl px-5 py-3 text-xs"
              onClick={() => {
                setModal(true);
                setMsg(null);
              }}
            >
              Validar ganador y acta
            </button>
          </div>
          <BingoGrid numbers={res.carton.numerosBingo} size="lg" />
        </div>
      )}

      {msg && (
        <p className={`celebrate mt-4 rounded-xl px-4 py-3 font-semibold ${msg.ok ? "bg-emerald-700 text-white" : "bg-red-800 text-red-50"}`}>
          {msg.text}
        </p>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="panel w-full max-w-lg rounded-2xl p-6">
            <h3 className="font-display text-xl gold-text">Acta de adjudicación</h3>
            <p className="mt-1 text-sm text-amber-100/80">
              El sistema bloqueará la operación si el cartón no está vendido.
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-amber-200">
              Premio / ronda
              <select className="mt-1 w-full rounded-xl px-3 py-3" value={premioId} onChange={(e) => setPremioId(e.target.value)}>
                {premios.map((p) => (
                  <option key={p.premio.id} value={p.premio.id}>
                    Ronda {p.premio.orden} · {p.premio.nombrePremio} ({p.premio.estado})
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs font-bold uppercase tracking-widest text-amber-200">
              Nota de escribanía
              <textarea className="mt-1 w-full rounded-xl px-3 py-3" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" className="gold-btn flex-1 rounded-xl py-3 text-xs" onClick={adjudicar}>
                Adjudicar y firmar acta
              </button>
              <button type="button" className="flex-1 rounded-xl border border-amber-400/30 py-3 text-xs uppercase" onClick={() => setModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
