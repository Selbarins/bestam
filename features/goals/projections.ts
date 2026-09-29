/** Monthly contribution needed to hit target by date */
export function monthlyNeeded(
  target: number,
  current: number,
  targetDate: string | null,
  now = new Date()
) {
  const remaining = Math.max(0, target - current);
  if (!targetDate || remaining <= 0) return { remaining, monthsLeft: 0, monthly: 0 };

  const end = new Date(targetDate);
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth()) +
    (end.getDate() >= now.getDate() ? 0 : -1);

  const monthsLeft = Math.max(1, months);
  return { remaining, monthsLeft, monthly: remaining / monthsLeft };
}

/** Emergency: how many months of expenses the fund covers */
export function emergencyMonths(fund: number, monthlyExpenses: number) {
  if (monthlyExpenses <= 0) return fund > 0 ? Infinity : 0;
  return fund / monthlyExpenses;
}

/** Cap progress this month */
export function capProgress(spent: number, limit: number) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  return { spent, limit, pct, remaining: Math.max(0, limit - spent), over: spent > limit };
}
