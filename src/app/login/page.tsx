import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { LoginForm } from "@/components/LoginForm";
import { BADGE_SISTEMA, EDICION, EVENTO, LEYENDA_PROVINCIAS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeeded();
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src="/images/hero-bingo.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-4">
            <img
              src="/images/logo-trophy.png"
              alt="Trofeo"
              className="h-20 w-20 rounded-full border border-amber-400/50 object-cover gold-glow"
            />
            <span className="rounded-full border border-amber-400/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
              {BADGE_SISTEMA}
            </span>
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight gold-text sm:text-6xl">{EVENTO}</h1>
          <p className="mt-2 text-lg uppercase tracking-[0.25em] text-amber-200">{EDICION}</p>
          <p className="mt-4 text-sm text-amber-100/80">{LEYENDA_PROVINCIAS}</p>
          <p className="mt-6 max-w-md text-slate-300">
            Trazabilidad total cartón → comprador (nombre + DNI) → vendedor → localidad → fecha → monto.
            Mesa de sorteo, bolillero y padrón oficial para el software de extracción.
          </p>
        </div>
        <div className="panel rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Acceso al sistema</p>
          <h2 className="mt-1 font-display text-2xl gold-text">Ingreso de operadores</h2>
          <Suspense fallback={<p className="mt-6 text-amber-200">Cargando…</p>}>
            <div className="mt-6">
              <LoginForm />
            </div>
          </Suspense>
        </div>
      </div>
    </main>
  );
}
