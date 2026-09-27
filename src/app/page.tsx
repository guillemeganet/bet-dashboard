import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
