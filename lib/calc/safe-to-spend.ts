type IncomeRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
};

type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: "planned" | "actual";
};

function toMad(amount: number | string, rate?: number | string | null) {
  return Number(amount) * Number(rate ?? 1);
}

function daysLeftInMonth(from = new Date()) {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.max(1, lastDay - from.getDate() + 1);
}

/**
 * Safe-to-Spend
 * (received − actual − planned expenses − cart − upcoming recurring expenses) / days left
 */
export function calcSafeToSpend(
  income: IncomeRow[],
  expenses: ExpenseRow[],
  cartTotalMad = 0,
  recurringExpenseMad = 0,
  now = new Date()
) {
  const received = income
    .filter((i) => i.received_at)
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);

  const actual = expenses
    .filter((e) => e.status === "actual")
    .reduce((s, e) => s + toMad(e.amount, e.rate_to_mad), 0);

  const planned = expenses
    .filter((e) => e.status === "planned")
    .reduce((s, e) => s + toMad(e.amount, e.rate_to_mad), 0);

  const available =
    received -
    actual -
    planned -
    Number(cartTotalMad || 0) -
    Number(recurringExpenseMad || 0);

  const days = daysLeftInMonth(now);

  return {
    daily: available / days,
    monthly: available,
    daysLeft: days,
  };
}
