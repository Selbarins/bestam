import { roundMoney } from "./money";

/** One cash event on the timeline (signed: + income, − outflow). */
export type TimelineEvent = {
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  kind:
    | "income"
    | "bill"
    | "planned"
    | "cart"
    | "goal"
    | "adjustment"
    | "purchase";
  label: string;
  /** Optional link back to a row id */
  sourceId?: string;
};

export type TimelinePoint = {
  date: string;
  /** Balance after applying events on this day */
  balance: number;
  events: TimelineEvent[];
};

export type TimelineResult = {
  points: TimelinePoint[];
  /** Lowest projected balance in the window */
  lowestBalance: number;
  lowestDate: string | null;
  /** Starting balance (today, before future events) */
  startBalance: number;
  /** Last day of the projection window */
  endDate: string;
};

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toIso(d);
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T12:00:00").getTime();
  const b = new Date(toIso + "T12:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Project balance day by day from today through endDate.
 *
 * startBalance = real available cash today (accounts in Safe-to-Spend).
 * events = future only (or today); past actuals should already be in startBalance.
 */
export function projectTimeline(
  startBalance: number,
  events: TimelineEvent[],
  endDate: string,
  now = new Date()
): TimelineResult {
  const today = toIso(now);
  const end = endDate < today ? today : endDate;

  // Group events by date
  const byDate = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    if (e.date < today) continue; // past events ignored (already in startBalance)
    if (e.date > end) continue;
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const points: TimelinePoint[] = [];
  let balance = roundMoney(startBalance);
  let lowestBalance = balance;
  let lowestDate: string | null = today;

  const totalDays = Math.max(0, daysBetween(today, end));

  for (let i = 0; i <= totalDays; i++) {
    const date = addDaysIso(today, i);
    const dayEvents = byDate.get(date) ?? [];
    for (const ev of dayEvents) {
      balance = roundMoney(balance + Number(ev.amount));
    }
    points.push({
      date,
      balance,
      events: dayEvents,
    });
    if (balance < lowestBalance) {
      lowestBalance = balance;
      lowestDate = date;
    }
  }

  return {
    points,
    lowestBalance: roundMoney(lowestBalance),
    lowestDate,
    startBalance: roundMoney(startBalance),
    endDate: end,
  };
}
