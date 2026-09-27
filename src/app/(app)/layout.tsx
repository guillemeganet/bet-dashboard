import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}
