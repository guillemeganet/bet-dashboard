"use client";

import { BingoGrid } from "./BingoGrid";
import { cartonCode, formatDateLong, money, metodoLabel } from "@/lib/format";
import { EDICION, EVENTO, LEYENDA_PROVINCIAS } from "@/lib/constants";
import type { Carton, Comprador, Localidad, Vendedor, Venta } from "@/db/schema";

export function TicketView({
  venta,
  carton,
  comprador,
  vendedor,
  localidad,
}: {
  venta: Venta;
  carton: Carton;
  comprador: Comprador;
  vendedor: Vendedor;
  localidad: Localidad;
}) {
  const code = cartonCode(carton.numeroCarton);
  const wa = new URL("https://wa.me/");
  wa.searchParams.set(
    "text",
    `🎉 *${EVENTO} ${EDICION}*\nCartón: *${code}*\nTitular: ${comprador.nombreCompleto}\nDNI: ${comprador.dni}\nLocalidad: ${localidad.nombre} (${localidad.provincia})\nMonto: ${money(venta.monto)}\nRecibo: ${venta.codigoRecibo}\nFecha: ${formatDateLong(venta.fechaVenta)}\n¡Mucha suerte!`,
  );

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button type="button" className="gold-btn rounded-xl px-5 py-2 text-xs" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
        <a href={wa.toString()} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold uppercase text-white">
          Compartir por WhatsApp
        </a>
      </div>

      <article className="ticket-sheet mx-auto max-w-2xl rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-amber-50 shadow-2xl print:max-w-none print:border-amber-800 print:bg-white print:text-black">
        <header className="flex items-center gap-4 border-b border-amber-400/40 pb-4">
          <img src="/images/logo-trophy.png" alt="" className="h-16 w-16 rounded-full object-cover" />
          <div>
            <p className="font-display text-2xl gold-text print:text-amber-800">{EVENTO}</p>
            <p className="text-[11px] uppercase tracking-[0.2em]">{EDICION}</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200 print:text-amber-700">{LEYENDA_PROVINCIAS}</p>
          </div>
        </header>
        <p className="mt-4 text-center font-display text-5xl font-black tracking-widest gold-text print:text-amber-900">
          {code}
        </p>
        <p className="text-center text-xs uppercase tracking-[0.25em] text-amber-200">
          {carton.serie} · {carton.talonario}
        </p>

        <div className="mt-5 grid gap-3 rounded-2xl border border-amber-400/30 bg-black/20 p-4 sm:grid-cols-2 print:bg-amber-50">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300">Titular</p>
            <p className="font-display text-xl">{comprador.nombreCompleto}</p>
            <span className="mt-1 inline-block rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-slate-950">
              DNI {comprador.dni}
            </span>
          </div>
          <div className="text-sm">
            <p>Vendedor: {vendedor.nombreCompleto}</p>
            <p>
              {localidad.nombre} · {localidad.provincia}
            </p>
            <p>Recibo {venta.codigoRecibo}</p>
            <p>{formatDateLong(venta.fechaVenta)}</p>
          </div>
        </div>

        <div className="mt-4">
          <BingoGrid numbers={carton.numerosBingo} size="lg" />
        </div>

        <footer className="mt-5 flex items-end justify-between gap-4 border-t border-amber-400/40 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300">Validación notarial</p>
            <p className="font-mono text-xs">QR-NEA-{venta.codigoRecibo}</p>
            <p className="mt-1 max-w-xs text-[10px] text-amber-100/70 print:text-slate-600">
              Este ticket acredita la titularidad del cartón para el sorteo provincial. El ganador se valida cruzando DNI + N° de cartón + recibo.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-amber-300">Total abonado</p>
            <p className="font-display text-3xl gold-text print:text-amber-900">{money(venta.monto)}</p>
            <p className="text-xs">{metodoLabel(venta.metodoPago)}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
