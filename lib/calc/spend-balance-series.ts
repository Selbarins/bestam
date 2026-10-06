import { toMad, roundMoney } from "./money";

export type SpendTx = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status?: string;
  spent_on?: string | null;
  categoryName?: string | null;
};

export type IncomeTx = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at?: string | null;
};

export type DayPoint = {
  date: string; // YYYY-MM-DD
  day: number;
  spent: number;
  balance: number; // month net from 0: income so far − spend so far
};

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/**
 * Daily spent bars + running month net (income − expenses) as balance line.
 * Filter spent by categoryName on the client; pass pre-filtered txs or filter here.
 */
export function buildSpendBalanceSeries(input: {
  year: number;
  monthIndex0: number; // 0 = Jan
  expenses: SpendTx[];
  income: IncomeTx[];
  categoryFilter?: string | null; // category name or null = all
}): DayPoint[] {
  const { year, monthIndex0, expenses, income, categoryFilter } = input;
  const dim = daysInMonth(year, monthIndex0);
  const prefix = `${year}-${String(monthIndex0 + 1).padStart(2, "0")}`;

  const spentByDay = new Map<number, number>();
  const incomeByDay = new Map<number, number>();

  for (const e of expenses) {
    if (e.status && e.status !== "actual") continue;
    if (!e.spent_on?.startsWith(prefix)) continue;
    if (categoryFilter && (e.categoryName || "Other") !== categoryFilter)
      continue;
    const day = Number(e.spent_on.slice(8, 10));
    if (!Number.isFinite(day)) continue;
    spentByDay.set(
      day,
      (spentByDay.get(day) || 0) + toMad(e.amount, e.rate_to_mad)
    );
  }

  for (const i of income) {
    if (!i.received_at?.startsWith(prefix)) continue;
    const day = Number(String(i.received_at).slice(8, 10));
    if (!Number.isFinite(day)) continue;
    incomeByDay.set(
      day,
      (incomeByDay.get(day) || 0) + toMad(i.amount, i.rate_to_mad)
    );
  }

  let cumIncome = 0;
  let cumSpent = 0;
  const points: DayPoint[] = [];

  for (let d = 1; d <= dim; d++) {
    const s = spentByDay.get(d) || 0;
    const inc = incomeByDay.get(d) || 0;
    cumIncome += inc;
    cumSpent += s;
    points.push({
      date: `${prefix}-${String(d).padStart(2, "0")}`,
      day: d,
      spent: roundMoney(s),
      balance: roundMoney(cumIncome - cumSpent),
    });
  }

  return points;
}

export function listCategoryNames(expenses: SpendTx[], monthPrefix: string) {
  const set = new Map<string, number>();
  for (const e of expenses) {
    if (e.status && e.status !== "actual") continue;
    if (!e.spent_on?.startsWith(monthPrefix)) continue;
    const name = e.categoryName || "Other";
    set.set(name, (set.get(name) || 0) + toMad(e.amount, e.rate_to_mad));
  }
  return [...set.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}
