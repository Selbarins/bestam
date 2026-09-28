export function formatMoney(
  amount: number | string | null | undefined,
  currency = "MAD",
  options?: { compact?: boolean }
) {
  const value = Number(amount ?? 0);

  if (options?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(amount: number | string | null | undefined) {
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}
