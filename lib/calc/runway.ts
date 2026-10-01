import { toMad, roundMoney } from "./money";

type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  /** essentials | lifestyle | growth | other — optional from join */
  bucket?: string | null;
};

export type RunwayResult = {
  /** Months at essentials-only average spend */
  essentialsMonths: number;
  /** Months at full lifestyle average spend */
  lifestyleMonths: number;
  avgEssentialsMonthly: number;
  avgLifestyleMonthly: number;
  balance: number;
  monthsOfHistory: number;
};

/**
 * Rough runway from recent actual spending history.
 * balance / average monthly spend.
 */
export function calcRunway(
  balance: number,
  expenses: ExpenseRow[],
  now = new Date(),
  historyMonths = 3
): RunwayResult {
  const end = new Date(now);
  const start = new Date(now);
  start.setMonth(start.getMonth() - historyMonths);
  const startIso = start.toISOString().slice(0, 10);

  const recent = expenses.filter(
    (e) =>
      e.status === "actual" &&
      e.spent_on &&
      e.spent_on >= startIso
  );

  let essentials = 0;
  let lifestyle = 0;

  for (const e of recent) {
    const mad = toMad(e.amount, e.rate_to_mad);
    const bucket = (e.bucket || "other").toLowerCase();
    if (bucket === "essentials") {
      essentials += mad;
    }
    lifestyle += mad; // all spending
  }

  const months = Math.max(1, historyMonths);
  const avgEssentialsMonthly = roundMoney(essentials / months);
  const avgLifestyleMonthly = roundMoney(lifestyle / months);

  const essentialsMonths =
    avgEssentialsMonthly > 0
      ? roundMoney(Math.max(0, balance) / avgEssentialsMonthly)
      : balance > 0
        ? 99
        : 0;

  const lifestyleMonths =
    avgLifestyleMonthly > 0
      ? roundMoney(Math.max(0, balance) / avgLifestyleMonthly)
      : balance > 0
        ? 99
        : 0;

  return {
    essentialsMonths: Math.min(essentialsMonths, 99),
    lifestyleMonths: Math.min(lifestyleMonths, 99),
    avgEssentialsMonthly,
    avgLifestyleMonthly,
    balance: roundMoney(balance),
    monthsOfHistory: historyMonths,
  };
}
