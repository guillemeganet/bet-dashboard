"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DNI_REGEX, METODOS_PAGO } from "@/lib/constants";
import { money, metodoLabel } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";
import { BingoGrid } from "./BingoGrid";
import { StatusBadge } from "./StatusBadge";

type Loc = { id: number; nombre: string; provincia: string };
type Vend = { id: number; nombreCompleto: string; codigoVendedor: string; localidadId: number };

type CartonInfo = {
  found: boolean;
  blocked?: boolean;
  message?: string;
  carton?: {
    numeroCarton: number;
    serie: string;
    talonario: string;
    precio: string;
    estado: string;
    numerosBingo: number[];
    vendedorNombre: string | null;
    localidadNombre: string | null;
  };
  titular?: { nombre: string; dni: string; recibo: string } | null;
};

export function PosForm({
  session,
  localidades,
  vendedores,
  initialCarton = "",
}: {
  session: SessionUser;
  localidades: Loc[];
  vendedores: Vend[];
  initialCarton?: string;
}) {
  const router = useRouter();
  const [numero, setNumero] = useState(initialCarton);
  const [carton, setCarton] = useState<CartonInfo | null>(null);
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [vendedorId, setVendedorId] = useState(
    session.vendedorId ? String(session.vendedorId) : vendedores[0] ? String(vendedores[0].id) : "",
  );
  const [localidadId, setLocalidadId] = useState(
    session.localidadId ? String(session.localidadId) : localidades[0] ? String(localidades[0].id) : "",
  );
  const [metodo, setMetodo] = useState("efectivo");
  const [monto, setMonto] = useState("5000");
  const [comprobante, setComprobante] = useState("");
  const [obs, setObs] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedVend = useMemo(
    () => vendedores.find((v) => String(v.id) === vendedorId),
    [vendedores, vendedorId],
  );

  useEffect(() => {
    if (selectedVend) setLocalidadId(String(selectedVend.localidadId));
  }, [selectedVend]);

  useEffect(() => {
    const n = Number(numero);
    if (!numero || !Number.isFinite(n) || n < 1000) {
      setCarton(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/cartones/lookup?numero=${n}`);
      if (res.status === 404) {
        setCarton({ found: false, message: "El cartón no existe en el padrón" });
        return;
      }
      if (res.ok) setCarton(await res.json());
    }, 250);
    return () => clearTimeout(t);
  }, [numero]);

  useEffect(() => {
    const digits = dni.replace(/\D/g, "");
    if (digits.length < 7) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/compradores/lookup?dni=${digits}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.found) {
        setNombre(data.comprador.nombreCompleto);
        setTelefono(data.comprador.telefono || "");
        setEmail(data.comprador.email || "");
        setDireccion(data.comprador.direccion || "");
      }
    }, 250);
    return () => clearTimeout(t);
  }, [dni]);

  useEffect(() => {
    if (carton?.carton?.precio) setMonto(String(Number(carton.carton.precio)));
  }, [carton]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) {
      setError("El NOMBRE COMPLETO es OBLIGATORIO para validar ganadores");
      return;
    }
    if (!DNI_REGEX.test(dni.replace(/\D/g, ""))) {
      setError("El DNI debe tener entre 7 y 9 dígitos numéricos");
      return;
    }
    if (carton?.blocked) {
      setError(carton.message || "Cartón bloqueado");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCarton: Number(numero),
          dni,
          nombreCompleto: nombre,
          telefono,
          email,
          direccion,
          vendedorId: Number(vendedorId),
          localidadId: Number(localidadId),
          metodoPago: metodo,
          monto: Number(monto),
          comprobantePago: comprobante,
          observaciones: obs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo registrar la venta");
        return;
      }
      router.push(`/ventas/${data.venta.id}/ticket`);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const canSell = carton?.found && !carton.blocked && carton.carton;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="panel space-y-4 rounded-2xl p-4 sm:p-6">
        <h2 className="font-display text-xl gold-text">Punto de venta territorial</h2>
        <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
          N° de cartón
          <input
            className="mt-1 w-full rounded-xl px-4 py-3 font-display text-2xl tracking-widest"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
            placeholder="100008"
            required
          />
        </label>
        {carton && !carton.found && (
          <p className="rounded-lg bg-red-950/70 px-3 py-2 text-sm text-red-200">{carton.message}</p>
        )}
        {carton?.found && carton.carton && (
          <div className={`rounded-xl border p-3 ${carton.blocked ? "border-red-400/50 bg-red-950/40" : "border-emerald-400/40 bg-emerald-950/30"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge estado={carton.carton.estado} />
              <span className="text-sm text-amber-100">
                {carton.carton.serie} · {carton.carton.talonario} · {money(carton.carton.precio)}
              </span>
            </div>
            {carton.blocked && (
              <p className="mt-2 text-sm font-semibold text-red-200">{carton.message}</p>
            )}
            {carton.carton.vendedorNombre && (
              <p className="mt-1 text-xs text-amber-200/80">
                Asignado a {carton.carton.vendedorNombre} · {carton.carton.localidadNombre}
              </p>
            )}
          </div>
        )}

        <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
          DNI del comprador
          <input
            className="mt-1 w-full rounded-xl px-4 py-3 text-lg"
            inputMode="numeric"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="28456789"
            required
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
          Nombre completo (obligatorio)
          <input
            className="mt-1 w-full rounded-xl px-4 py-3 uppercase"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.toUpperCase())}
            required
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Teléfono / WhatsApp
            <input className="mt-1 w-full rounded-xl px-4 py-3" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Email
            <input className="mt-1 w-full rounded-xl px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
        <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
          Domicilio
          <input className="mt-1 w-full rounded-xl px-4 py-3" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Vendedor responsable
            <select
              className="mt-1 w-full rounded-xl px-4 py-3"
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              disabled={session.role === "vendedor"}
            >
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.codigoVendedor} · {v.nombreCompleto}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Localidad de venta
            <select className="mt-1 w-full rounded-xl px-4 py-3" value={localidadId} onChange={(e) => setLocalidadId(e.target.value)}>
              {localidades.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre} · {l.provincia}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Método de pago
            <select className="mt-1 w-full rounded-xl px-4 py-3" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {metodoLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Monto
            <input
              className="mt-1 w-full rounded-xl px-4 py-3"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </label>
        </div>
        {metodo !== "efectivo" && (
          <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
            Comprobante de pago
            <input className="mt-1 w-full rounded-xl px-4 py-3" value={comprobante} onChange={(e) => setComprobante(e.target.value)} required />
          </label>
        )}
        <label className="block text-xs font-bold uppercase tracking-widest text-amber-200">
          Observaciones
          <textarea className="mt-1 w-full rounded-xl px-4 py-3" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
        </label>
        {error && (
          <p className="rounded-lg border border-red-400/40 bg-red-950/70 px-3 py-2 text-sm font-semibold text-red-100">
            {error}
          </p>
        )}
        <button className="gold-btn w-full rounded-xl py-4 text-sm" disabled={loading || !canSell} type="submit">
          {loading ? "Registrando…" : "Confirmar venta y emitir ticket"}
        </button>
      </div>
      <aside className="panel rounded-2xl p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Vista previa del cartón</p>
        {carton?.carton ? (
          <>
            <p className="mt-2 font-display text-3xl gold-text">BD-{String(carton.carton.numeroCarton).padStart(6, "0")}</p>
            <BingoGrid numbers={carton.carton.numerosBingo} size="lg" />
          </>
        ) : (
          <p className="mt-6 text-sm text-slate-400">Ingresá un número de cartón para validar serie, talonario y disponibilidad en vivo.</p>
        )}
      </aside>
    </form>
  );
}
