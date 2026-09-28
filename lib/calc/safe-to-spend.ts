/**
 * Safe-to-Spend v1
 * balance / days remaining in the current month (including today)
 *
 * Later: subtract planned cart, fixed bills, goal reserves first.
 */
export function calcSafeToSpend(balance: number, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const lastDay = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDay - day + 1);

  const safe = balance / daysLeft;

  return {
    safe: Math.max(0, safe),
    daysLeft,
    balance,
  };
}
