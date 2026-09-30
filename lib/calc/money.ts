/**
 * Convert any amount + optional rate into MAD, rounded to 2 decimals.
 * All money math should go through this (or roundMoney) so we never
 * accumulate floating-point dust.
 */
export function toMad(
  amount: number | string,
  rate?: number | string | null
): number {
  const a = Number(amount);
  const r = Number(rate ?? 1);
  if (!Number.isFinite(a) || !Number.isFinite(r)) return 0;
  return roundMoney(a * r);
}

/** Round to 2 decimal places (MAD centimes). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
