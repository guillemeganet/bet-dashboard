export function StatusBadge({ estado }: { estado: string }) {
  const cls = `badge-${estado}` as const;
  return (
    <span className={`${cls} inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide`}>
      {estado.replace("_", " ")}
    </span>
  );
}
