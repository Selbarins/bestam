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
  safetyBuffer: number;
  /** 0–1 how much of received income is still free this period */
  freeRatio: number;
};

export type SafeToSpendOptions = {
  cartTotalMad?: number;
  /** Only *unpaid* recurring expense totals for the current period */
  unpaidRecurringMad?: number;
  goalReservesMad?: number;
  safetyBufferMad?: number;
  /** Days left in pay cycle (from calcPayCycle). Falls back to calendar month if omitted. */
  daysLeft?: number;
  now?: Date;
};

function daysLeftInMonth(from = new Date()) {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.max(1, lastDay - from.getDate() + 1);
}

/**
 * Safe-to-Spend (still period-based v1, not full timeline yet)
 *
 * free = received − actual − planned − cart − unpaidRecurring − goalReserves − safetyBuffer
 * daily = free / daysLeft
 */
export function calcSafeToSpend(
  income: IncomeRow[],
  expenses: ExpenseRow[],
  options: SafeToSpendOptions = {}
): SafeToSpendResult {
  const {
    cartTotalMad = 0,
    unpaidRecurringMad = 0,
    goalReservesMad = 0,
    safetyBufferMad = 0,
    daysLeft: daysLeftOpt,
    now = new Date(),
  } = options;

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
  const recurring = roundMoney(Number(unpaidRecurringMad) || 0);
  const goalReserves = roundMoney(Number(goalReservesMad) || 0);
  const safetyBuffer = roundMoney(Number(safetyBufferMad) || 0);

  const monthly = roundMoney(
    received - actual - planned - cart - recurring - goalReserves - safetyBuffer
  );

  const days =
    daysLeftOpt != null && daysLeftOpt > 0
      ? Math.max(1, Math.round(daysLeftOpt))
      : daysLeftInMonth(now);

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
    safetyBuffer,
    freeRatio,
  };
}
