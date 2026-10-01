import { toMad, roundMoney } from "./money";
import type { TimelineEvent } from "./timeline";
import { periodMonthKey } from "./pay-cycle";

type IncomeRow = {
  id?: string;
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
  expected_on?: string | null;
  is_salary?: boolean | null;
  name?: string | null;
};

type ExpenseRow = {
  id?: string;
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  note?: string | null;
};

type RecurringRow = {
  id: string;
  kind: string;
  name: string;
  amount: number | string;
  rate_to_mad?: number | string | null;
  day_of_month: number;
  active: boolean;
};

type OccurrenceRow = {
  recurring_item_id: string;
  status: string;
  period_month: string;
};

type CartRow = {
  id?: string;
  name?: string | null;
  estimated_amount: number | string;
  rate_to_mad?: number | string | null;
};

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Next occurrence of day_of_month on or after today, within endDate. */
function nextBillDate(
  dayOfMonth: number,
  today: string,
  endDate: string
): string | null {
  const day = Math.min(28, Math.max(1, dayOfMonth));
  const [y, m] = today.split("-").map(Number);
  // this month
  let candidate = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (candidate < today) {
    // next month
    const next = new Date(y, m, day); // month m is already next in 0-index when day overflows… use carefully
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    candidate = `${ny}-${String(nm).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  if (candidate > endDate) return null;
  return candidate;
}

export type BuildEventsInput = {
  income: IncomeRow[];
  expenses: ExpenseRow[];
  recurring: RecurringRow[];
  occurrences: OccurrenceRow[];
  cart: CartRow[];
  /** Optional monthly goal set-aside placed on cycle end as a reserve */
  goalReservesMad?: number;
  endDate: string;
  now?: Date;
};

/**
 * Future events only. Past actual income/expenses should already be
 * reflected in startBalance (book balance of spendable accounts).
 */
export function buildTimelineEvents(input: BuildEventsInput): TimelineEvent[] {
  const {
    income,
    expenses,
    recurring,
    occurrences,
    cart,
    goalReservesMad = 0,
    endDate,
    now = new Date(),
  } = input;

  const today = toIso(now);
  const period = periodMonthKey(now);
  const events: TimelineEvent[] = [];

  const settled = new Set(
    occurrences
      .filter(
        (o) =>
          o.period_month === period &&
          (o.status === "paid" || o.status === "skipped")
      )
      .map((o) => o.recurring_item_id)
  );

  // Expected income not yet received (including next salary hint)
  for (const row of income) {
    if (row.received_at) continue;
    const date = (row.expected_on || "").slice(0, 10);
    if (!date || date < today || date > endDate) continue;
    const amount = toMad(row.amount, row.rate_to_mad);
    if (amount <= 0) continue;
    events.push({
      date,
      amount,
      kind: "income",
      label: row.name || (row.is_salary ? "Salary" : "Expected income"),
      sourceId: row.id,
    });
  }

  // Planned expenses
  for (const row of expenses) {
    if (row.status !== "planned") continue;
    const date = (row.spent_on || today).slice(0, 10);
    if (date < today || date > endDate) continue;
    const amount = toMad(row.amount, row.rate_to_mad);
    if (amount <= 0) continue;
    events.push({
      date,
      amount: -amount,
      kind: "planned",
      label: row.note || "Planned",
      sourceId: row.id,
    });
  }

  // Unpaid recurring expenses → bill on next day_of_month
  for (const row of recurring) {
    if (!row.active || row.kind !== "expense") continue;
    if (settled.has(row.id)) continue;
    const date = nextBillDate(row.day_of_month, today, endDate);
    if (!date) continue;
    const amount = toMad(row.amount, row.rate_to_mad);
    if (amount <= 0) continue;
    events.push({
      date,
      amount: -amount,
      kind: "bill",
      label: row.name,
      sourceId: row.id,
    });
  }

  // Active recurring income not yet received this period → expected on day_of_month
  for (const row of recurring) {
    if (!row.active || row.kind !== "income") continue;
    if (settled.has(row.id)) continue;
    const date = nextBillDate(row.day_of_month, today, endDate);
    if (!date) continue;
    const amount = toMad(row.amount, row.rate_to_mad);
    if (amount <= 0) continue;
    events.push({
      date,
      amount,
      kind: "income",
      label: row.name,
      sourceId: row.id,
    });
  }

  // Cart items as planned outflows on today (conservative)
  for (const row of cart) {
    const amount = toMad(row.estimated_amount, row.rate_to_mad);
    if (amount <= 0) continue;
    events.push({
      date: today,
      amount: -amount,
      kind: "cart",
      label: row.name || "Cart item",
      sourceId: row.id,
    });
  }

  // Goal reserve: one outflow on cycle end (simple v1 of reserves on timeline)
  if (goalReservesMad > 0) {
    events.push({
      date: endDate,
      amount: -roundMoney(goalReservesMad),
      kind: "goal",
      label: "Goal set-aside",
    });
  }

  return events;
}
