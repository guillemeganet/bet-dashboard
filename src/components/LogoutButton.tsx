"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-200 hover:bg-amber-400/10"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
