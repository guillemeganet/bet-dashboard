"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_PASSWORD } from "@/lib/constants";

const DEMOS = [
  { email: "admin@bingodorado.com", role: "Admin provincial", hint: "Acceso total" },
  { email: "referente@bingodorado.com", role: "Referente Resistencia", hint: "Solo su localidad" },
  { email: "vendedor@bingodorado.com", role: "Vendedor territorial", hint: "POS móvil" },
  { email: "escribania@bingodorado.com", role: "Escribanía", hint: "Mesa de sorteo" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@bingodorado.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo ingresar");
        return;
      }
      const next = params.get("next") || "/dashboard";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
        Correo
        <input
          className="mt-1 w-full rounded-xl px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="username"
        />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
        Contraseña
        <input
          className="mt-1 w-full rounded-xl px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="rounded-lg border border-red-400/40 bg-red-950/60 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <button className="gold-btn w-full rounded-xl py-3.5 text-sm" disabled={loading} type="submit">
        {loading ? "Validando…" : "Ingresar al sistema provincial"}
      </button>
      <p className="text-center text-[11px] uppercase tracking-widest text-amber-200/70">
        Accesos de demostración · clave {DEMO_PASSWORD}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DEMOS.map((d) => (
          <button
            key={d.email}
            type="button"
            onClick={() => {
              setEmail(d.email);
              setPassword(DEMO_PASSWORD);
            }}
            className="rounded-xl border border-amber-400/25 bg-slate-950/50 px-3 py-2 text-left hover:border-amber-300/60"
          >
            <div className="text-xs font-bold text-amber-100">{d.role}</div>
            <div className="truncate text-[11px] text-amber-200/70">{d.email}</div>
            <div className="text-[10px] uppercase tracking-wide text-yellow-500">{d.hint}</div>
          </button>
        ))}
      </div>
    </form>
  );
}
