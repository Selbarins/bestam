import { toMad, roundMoney } from "./money";

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

function daysLeftInMonth(from = new Date()) {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.max(1, lastDay - from.getDate() + 1);
}

export type SafeToSpendResult = {
  daily: number;
  monthly: number;
  daysLeft: number;
  received: number;
  actual: number;
  planned: number;
  cart: number;
  recurring: number;
  goalReserves: number;
  /** 0–1 how much of received income is still free this month */
  freeRatio: number;
};

/**
 * Safe-to-Spend v1
 * (received − actual − planned − cart − recurring − goal reserves) / days left
 * Will be replaced by timeline-based v2 later.
 */
export function calcSafeToSpend(
  income: IncomeRow[],
  expenses: ExpenseRow[],
  cartTotalMad = 0,
  recurringExpenseMad = 0,
  goalReservesMad = 0,
  now = new Date()
): SafeToSpendResult {
  const received = income
    .filter((i) => i.received_at)
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);

  const actual = expenses
    .filter((e) => e.status === "actual")
    .reduce((s, e) => s + toMad(e.amount, e.rate_to_mad), 0);

  const planned = expenses
    .filter((e) => e.status === "planned")
    .reduce((s, e) => s + toMad(e.amount, e.rate_to_mad), 0);

  const cart = roundMoney(Number(cartTotalMad) || 0);
  const recurring = roundMoney(Number(recurringExpenseMad) || 0);
  const goalReserves = roundMoney(Number(goalReservesMad) || 0);

  const monthly = roundMoney(
    received - actual - planned - cart - recurring - goalReserves
  );
  const days = daysLeftInMonth(now);

  const freeRatio =
    received > 0
      ? Math.max(0, Math.min(1, monthly / received))
      : monthly > 0
        ? 1
        : 0;

  return {
    daily: roundMoney(monthly / days),
    monthly,
    daysLeft: days,
    received,
    actual,
    planned,
    cart,
    recurring,
    goalReserves,
    freeRatio,
  };
}
