/** "0.35s" -> 350, "200ms" -> 200. Anything else falls back. */
export function toMs(value: string | undefined, fallback = 350): number {
  const match = /^\s*(\d*\.?\d+)\s*(ms|s)\s*$/.exec(value ?? "");
  if (!match) return fallback;
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1);
}
