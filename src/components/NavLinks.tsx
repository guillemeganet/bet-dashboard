"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/db/schema";
import { navFor } from "@/lib/auth-paths";

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || (href !== "/dashboard" && href !== "/ventas" && pathname.startsWith(`${href}/`)) ||
    (href === "/ventas" && pathname.startsWith("/ventas/") && !pathname.startsWith("/ventas/nueva"));
}

/** Vertical sidebar navigation (desktop). */
export function SideNav({ role }: { role: Role }) {
  const isActive = useActive();
  return (
    <nav className="flex flex-col gap-1">
      {navFor(role).map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "border border-amber-400/50 bg-amber-400/10 font-semibold text-yellow-300"
                : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-amber-100"
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {active && <span className="text-amber-300">›</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal scrolling tabs (mobile). */
export function NavLinks({ role }: { role: Role }) {
  const isActive = useActive();
  return (
    <nav className="flex gap-1 overflow-x-auto px-2 py-1">
      {navFor(role).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={isActive(item.href)}
          className="nav-tab whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide"
        >
          <span className="mr-1">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
