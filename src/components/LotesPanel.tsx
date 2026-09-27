"use client";

import { useState } from "react";
import { asignarLote, generarLote } from "@/app/actions";

type Vend = { id: number; codigoVendedor: string; nombreCompleto: string };

export function LotesPanel({ vendedores }: { vendedores: Vend[] }) {
  const [open, setOpen] = useState<"gen" | "asig" | null>(null);
  const [msg, setMsg] = useState("");

  return (
    <div className="no-print">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="gold-btn rounded-xl px-4 py-2 text-xs" onClick={() => setOpen("gen")}>
          Generar lote por rango
        </button>
        <button
          type="button"
          className="rounded-xl border border-amber-400/40 px-4 py-2 text-xs font-bold uppercase text-amber-100"
          onClick={() => setOpen("asig")}
        >
          Asignar rango a vendedor
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-amber-100">{msg}</p>}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form
            className="panel w-full max-w-lg space-y-3 rounded-2xl p-6"
            action={async (fd) => {
              const result = open === "gen" ? await generarLote(fd) : await asignarLote(fd);
              if ("error" in result && result.error) setMsg(result.error);
              else if ("creados" in result) setMsg(`Lote creado: ${result.creados} cartones`);
              else if ("asignados" in result) setMsg(`Asignados: ${result.asignados} cartones`);
              setOpen(null);
            }}
          >
            <h3 className="font-display text-xl gold-text">
              {open === "gen" ? "Generar lote (máx. 1000)" : "Asignar talonario / rango"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase text-amber-200">
                Desde
                <input name="desde" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue="100201" required />
              </label>
              <label className="text-xs font-bold uppercase text-amber-200">
                Hasta
                <input name="hasta" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue="100250" required />
              </label>
            </div>
            {open === "gen" && (
              <>
                <label className="block text-xs font-bold uppercase text-amber-200">
                  Serie
                  <input name="serie" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue="SERIE-ORO-2026" />
                </label>
                <label className="block text-xs font-bold uppercase text-amber-200">
                  Precio
                  <input name="precio" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue="5000.00" />
                </label>
              </>
            )}
            <label className="block text-xs font-bold uppercase text-amber-200">
              Vendedor {open === "gen" ? "(opcional)" : ""}
              <select name="vendedorId" className="mt-1 w-full rounded-xl px-3 py-2" required={open === "asig"}>
                {open === "gen" && <option value="">Depósito (sin asignar)</option>}
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.codigoVendedor} · {v.nombreCompleto}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button className="gold-btn flex-1 rounded-xl py-3 text-xs" type="submit">
                Confirmar
              </button>
              <button type="button" className="flex-1 rounded-xl border border-amber-400/30 py-3 text-xs uppercase" onClick={() => setOpen(null)}>
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
