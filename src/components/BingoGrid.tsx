import { bingoGrid } from "@/lib/bingo";

export function BingoGrid({
  numbers,
  size = "md",
  drawn = [],
}: {
  numbers: number[];
  size?: "sm" | "md" | "lg";
  drawn?: number[];
}) {
  const grid = bingoGrid(numbers);
  const cell =
    size === "lg"
      ? "h-14 text-xl"
      : size === "sm"
        ? "h-8 text-xs"
        : "h-11 text-base";
  return (
    <div className="overflow-hidden rounded-xl border border-amber-400/40 bg-slate-950/70 p-2">
      <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
        Grilla oficial 3 × 5
      </div>
      <div className="grid grid-rows-3 gap-1">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-5 gap-1">
            {row.map((n, ci) => {
              const hit = drawn.includes(n);
              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`${cell} grid place-items-center rounded-md font-display font-bold ${
                    hit
                      ? "bg-gradient-to-b from-yellow-200 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(253,224,71,0.7)]"
                      : "bg-gradient-to-b from-slate-800 to-slate-950 text-amber-100"
                  }`}
                >
                  {n || "—"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
