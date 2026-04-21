export function fmtMins(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}时`;
  return `${h}时${m}分`;
}
