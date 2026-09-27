/** Deterministic 15 unique numbers (1-90) from a carton serial. */
export function generateBingoNumbers(seed: number): number[] {
  const nums = new Set<number>();
  let x = (seed * 1103515245 + 12345) >>> 0;
  while (nums.size < 15) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    nums.add((x % 90) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

export function bingoGrid(numbers: number[]): number[][] {
  const n = numbers.slice(0, 15);
  while (n.length < 15) n.push(0);
  return [n.slice(0, 5), n.slice(5, 10), n.slice(10, 15)];
}

export function talonarioFor(numero: number, start = 100001) {
  const idx = Math.floor((numero - start) / 20);
  const n = Math.max(1, idx + 1);
  return `TAL-${String(n).padStart(2, "0")}`;
}
