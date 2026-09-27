import Link from "next/link";
import { Ticker } from "./Ticker";
import type { SessionUser } from "@/lib/auth";
import { NavLinks, SideNav } from "./NavLinks";
import { BADGE_SISTEMA, EDICION, EVENTO, LEYENDA_PROVINCIAS, ROLE_LABEL } from "@/lib/constants";
import { getTickerStats } from "@/lib/queries";
import { LogoutButton } from "./LogoutButton";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export async function AppShell({
  session,
  children,
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  const stats = await getTickerStats(session);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar: fija a la izquierda, alto de pantalla, el contenido va AL LADO */}
      <aside className="no-print hidden border-r border-amber-500/15 bg-slate-950/80 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="p-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="/images/logo-trophy.png"
              alt="Trofeo"
              className="h-11 w-11 rounded-xl border border-amber-400/50 object-cover"
            />
            <div>
              <p className="font-display text-sm font-bold leading-tight gold-text">BINGO DORADO</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">DEL NEA · 2026</p>
            </div>
          </Link>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">{BADGE_SISTEMA}</span>
          </div>
        </div>
        <div className="flex-1 px-3">
          <SideNav role={session.role} />
        </div>
        <div className="m-3 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-slate-900/70 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-b from-yellow-300 to-amber-600 text-xs font-black text-slate-950">
            {initials(session.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-amber-50">{session.name}</p>
            <p className="truncate text-[10px] text-amber-300/80">{ROLE_LABEL[session.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Columna de contenido */}
      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-40 border-b border-amber-500/15 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
            <img src="/images/logo-trophy.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold gold-text">{EVENTO}</p>
              <p className="truncate text-[10px] uppercase tracking-widest text-amber-200/70">{LEYENDA_PROVINCIAS}</p>
            </div>
            <LogoutButton />
          </div>
          <div className="hidden items-center justify-between px-6 py-2 lg:flex">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80">
              {EVENTO} · {EDICION} · {LEYENDA_PROVINCIAS}
            </p>
          </div>
          <Ticker initial={stats} />
          <div className="lg:hidden">
            <NavLinks role={session.role} />
          </div>
        </header>
        <main className="w-full flex-1 px-4 py-6 lg:px-8">{children}</main>
        <footer className="no-print px-4 pb-8 text-center text-[11px] uppercase tracking-[0.2em] text-amber-200/40">
          {EVENTO} · Trazabilidad cartón → comprador → vendedor → localidad
        </footer>
      </div>
    </div>
  );
}
