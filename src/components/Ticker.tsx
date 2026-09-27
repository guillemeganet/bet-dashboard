"use client";

import { useEffect, useState } from "react";
import { cartonCode, money } from "@/lib/format";

type Stats = {
  recaudacion: number;
  vendidos: number;
  totalCartones: number;
  vendedoresActivos: number;
  vendedoresTotal: number;
  ultima: {
    numeroCarton: number;
    titular: string;
    localidad: string;
    provincia: string;
    monto: string;
    recibo: string;
  } | null;
};

export function Ticker({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/ticker", { cache: "no-store" });
        if (res.ok) setStats(await res.json());
      } catch {
        /* ignore */
      }
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const avance =
    stats.totalCartones > 0 ? Math.round((stats.vendidos / stats.totalCartones) * 1000) / 10 : 0;

  return (
    <div className="ticker no-print overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-100">
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
          EN VIVO
        </span>
        <span>
          Recaudación <b className="text-yellow-300">{money(stats.recaudacion)}</b>
        </span>
        <span>
          Avance <b className="text-yellow-300">{stats.vendidos}/{stats.totalCartones}</b> ({avance}%)
        </span>
        <span>
          Vendedores activos <b className="text-yellow-300">{stats.vendedoresActivos}/{stats.vendedoresTotal}</b>
        </span>
        {stats.ultima && (
          <span className="truncate text-amber-50/90">
            Última venta · {cartonCode(stats.ultima.numeroCarton)} · {stats.ultima.titular} ·{" "}
            {stats.ultima.localidad}
          </span>
        )}
      </div>
    </div>
  );
}
