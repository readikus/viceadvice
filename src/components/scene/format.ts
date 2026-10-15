export function formatPounds(n: number): string {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

export function formatDelta(n: number): string {
  return `${n >= 0 ? "+" : "−"}${formatPounds(Math.abs(n))}`;
}
