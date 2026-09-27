export function money(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function moneyExact(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function num(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("es-AR").format(Number.isFinite(n) ? n : 0);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function formatDateLong(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function cartonCode(numero: number) {
  return `BD-${String(numero).padStart(6, "0")}`;
}

export function toNumber(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(n) ? n : 0;
}

export function metodoLabel(metodo: string) {
  const map: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    mercadopago: "Mercado Pago",
    debito: "Débito",
  };
  return map[metodo] ?? metodo;
}

export function estadoCartonLabel(estado: string) {
  const map: Record<string, string> = {
    disponible: "Disponible",
    asignado: "Asignado / en calle",
    vendido: "Vendido",
    anulado: "Anulado",
    devuelto: "Devuelto",
  };
  return map[estado] ?? estado;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
