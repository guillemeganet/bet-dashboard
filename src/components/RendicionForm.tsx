"use client";

import { useState } from "react";
import { crearRendicion } from "@/app/actions";
import { money } from "@/lib/format";

type Vend = { id: number; codigoVendedor: string; nombreCompleto: string };

type Caja = {
  entregados: number;
  vendidos: number;
  devueltos: number;
  bruto: number;
  comision: number;
  aRendir: number;
  vendedor: { comisionPorcentaje: string };
};

export function RendicionForm({ vendedores }: { vendedores: Vend[] }) {
  const [open, setOpen] = useState(false);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [rendido, setRendido] = useState("0");
  const [msg, setMsg] = useState("");

  async function onVend(id: string) {
    if (!id) {
      setCaja(null);
      return;
    }
    const res = await fetch(`/api/vendedores/${id}/estado`);
    if (res.ok) {
      const data = await res.json();
      setCaja(data);
      setRendido(String(data.aRendir));
    }
  }

  const diferencia = caja ? Number(rendido || 0) - caja.aRendir : 0;

  return (
    <div>
      <button type="button" className="gold-btn rounded-xl px-4 py-2 text-xs" onClick={() => setOpen(true)}>
        Nueva rendición
      </button>
      {msg && <p className="mt-2 text-sm text-amber-100">{msg}</p>}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form
            className="panel w-full max-w-lg space-y-3 rounded-2xl p-6"
            action={async (fd) => {
              const r = await crearRendicion(fd);
              if (r.error) setMsg(r.error);
              else {
                setMsg("Rendición registrada");
                setOpen(false);
              }
            }}
          >
            <h3 className="font-display text-xl gold-text">Nueva rendición</h3>
            <label className="block text-xs font-bold uppercase text-amber-200">
              Vendedor
              <select
                name="vendedorId"
                className="mt-1 w-full rounded-xl px-3 py-2"
                required
                onChange={(e) => onVend(e.target.value)}
              >
                <option value="">Elegir vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.codigoVendedor} · {v.nombreCompleto}
                  </option>
                ))}
              </select>
            </label>
            {caja && (
              <div className="rounded-xl border border-amber-400/30 bg-slate-950/60 p-3 text-sm text-amber-50">
                <p>Entregados: {caja.entregados} · Vendidos: {caja.vendidos} · Devueltos stock: {caja.devueltos}</p>
                <p>Bruto: {money(caja.bruto)} · Comisión {caja.vendedor.comisionPorcentaje}%: {money(caja.comision)}</p>
                <p className="font-bold text-yellow-300">Total a rendir: {money(caja.aRendir)}</p>
              </div>
            )}
            <label className="block text-xs font-bold uppercase text-amber-200">
              Devueltos físicos
              <input name="cartonesDevueltos" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue={0} />
            </label>
            <label className="block text-xs font-bold uppercase text-amber-200">
              Monto depositado / rendido
              <input
                name="totalRendido"
                className="mt-1 w-full rounded-xl px-3 py-2"
                value={rendido}
                onChange={(e) => setRendido(e.target.value)}
              />
            </label>
            <p className="text-sm">
              Diferencia (rendido − a rendir):{" "}
              <b className={diferencia < 0 ? "text-red-300" : "text-emerald-300"}>{money(diferencia)}</b>
            </p>
            <label className="block text-xs font-bold uppercase text-amber-200">
              Estado
              <select name="estado" className="mt-1 w-full rounded-xl px-3 py-2" defaultValue="pendiente">
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="saldado">Saldado</option>
                <option value="auditado">Auditado</option>
              </select>
            </label>
            <label className="block text-xs font-bold uppercase text-amber-200">
              Comprobante depósito
              <input name="comprobanteDeposito" className="mt-1 w-full rounded-xl px-3 py-2" />
            </label>
            <label className="block text-xs font-bold uppercase text-amber-200">
              Observaciones
              <textarea name="observaciones" className="mt-1 w-full rounded-xl px-3 py-2" rows={2} />
            </label>
            <div className="flex gap-2">
              <button className="gold-btn flex-1 rounded-xl py-3 text-xs" type="submit">
                Guardar
              </button>
              <button type="button" className="flex-1 rounded-xl border border-amber-400/30 py-3 text-xs uppercase" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
