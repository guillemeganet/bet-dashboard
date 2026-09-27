export const EVENTO = "BINGO DORADO DEL NEA";
export const EDICION = "Edición Provincial 2026";
export const LEYENDA_PROVINCIAS = "Chaco • Corrientes • Misiones • Formosa";
export const BADGE_SISTEMA = "Sistema Provincial en Vivo";
export const PRECIO_DEFAULT = 5000;
export const SERIE_DEFAULT = "SERIE-ORO-2026";
export const ANIO = 2026;
export const DEMO_PASSWORD = "BingoDorado2026";

export const PROVINCIAS = ["Chaco", "Corrientes", "Misiones", "Formosa"] as const;
export type Provincia = (typeof PROVINCIAS)[number];

export const METODOS_PAGO = [
  "efectivo",
  "transferencia",
  "mercadopago",
  "debito",
] as const;

export const DNI_REGEX = /^[0-9]{7,9}$/;

export const COOKIE_NAME = "bingo_dorado_session";

export const NAV_BY_ROLE: Record<
  string,
  { href: string; label: string; icon: string }[]
> = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "◆" },
    { href: "/ventas/nueva", label: "Vender", icon: "★" },
    { href: "/ventas", label: "Ventas", icon: "🧾" },
    { href: "/cartones", label: "Cartones", icon: "🎫" },
    { href: "/localidades", label: "Localidades", icon: "📍" },
    { href: "/vendedores", label: "Vendedores", icon: "👥" },
    { href: "/compradores", label: "Compradores", icon: "🪪" },
    { href: "/rendiciones", label: "Rendiciones", icon: "💼" },
    { href: "/sorteo", label: "Mesa de sorteo", icon: "🎲" },
    { href: "/exportar", label: "Exportar", icon: "⇩" },
  ],
  referente: [
    { href: "/dashboard", label: "Dashboard", icon: "◆" },
    { href: "/ventas/nueva", label: "Vender", icon: "★" },
    { href: "/ventas", label: "Ventas", icon: "🧾" },
    { href: "/cartones", label: "Cartones", icon: "🎫" },
    { href: "/vendedores", label: "Vendedores", icon: "👥" },
    { href: "/compradores", label: "Compradores", icon: "🪪" },
    { href: "/rendiciones", label: "Rendiciones", icon: "💼" },
    { href: "/exportar", label: "Exportar", icon: "⇩" },
  ],
  vendedor: [
    { href: "/dashboard", label: "Inicio", icon: "◆" },
    { href: "/ventas/nueva", label: "Vender", icon: "★" },
    { href: "/ventas", label: "Mis ventas", icon: "🧾" },
    { href: "/cartones", label: "Mi stock", icon: "🎫" },
  ],
  escribano: [
    { href: "/dashboard", label: "Resumen", icon: "◆" },
    { href: "/sorteo", label: "Mesa de sorteo", icon: "🎲" },
    { href: "/exportar", label: "Padrón oficial", icon: "⇩" },
    { href: "/compradores", label: "Titulares", icon: "🪪" },
  ],
};

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administración provincial",
  referente: "Referente de localidad",
  vendedor: "Vendedor territorial",
  escribano: "Escribanía / Mesa de sorteo",
};
