import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import { EDICION, EVENTO, LEYENDA_PROVINCIAS } from "@/lib/constants";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["500", "700", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: `${EVENTO} — ${EDICION}`,
  description: `Gestión provincial de cartones de bingo. ${LEYENDA_PROVINCIAS}.`,
  icons: { icon: "/images/logo-trophy.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${cinzel.variable} ${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
