import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="panel max-w-lg rounded-3xl p-8 text-center">
        <p className="font-display text-5xl gold-text">404</p>
        <p className="mt-2 text-amber-100">Esa página no está en el padrón provincial.</p>
        <Link href="/dashboard" className="gold-btn mt-6 inline-flex rounded-xl px-5 py-3 text-xs">
          Volver al sistema
        </Link>
      </div>
    </main>
  );
}
