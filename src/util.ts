export function formatNumber(n: number): number {
  const decimal = 100;
  return Math.floor(n * decimal) / decimal;
}
