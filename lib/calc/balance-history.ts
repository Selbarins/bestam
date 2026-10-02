import { toMad, roundMoney } from "./money";
import type { TimelinePoint } from "./timeline";

type Tx = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  date: string; // YYYY-MM-DD
  /** +1 income, -1 expense */
  sign: 1 | -1;
};

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toIso(d);
}

/**
 * Build a continuous series: past (reconstructed) + future (projected).
 * todayBalance = spendable book balance now.
 * futurePoints = timeline.points from projectTimeline (includes today onward).
 */
export function buildBalanceSeries(input: {
  todayBalance: number;
  futurePoints: TimelinePoint[];
  /** Actual income (received) and expenses (actual) with dates */
  pastTx: Tx[];
  /** How many past days to show (default 14) */
  pastDays?: number;
  now?: Date;
}): { date: string; balance: number; phase: "past" | "today" | "future" }[] {
  const now = input.now ?? new Date();
  const today = toIso(now);
  const pastDays = input.pastDays ?? 14;
  const startPast = addDays(today, -pastDays);

  // Net cashflow per past day
  const netByDay = new Map<string, number>();
  for (const t of input.pastTx) {
    if (t.date < startPast || t.date > today) continue;
    const mad = toMad(t.amount, t.rate_to_mad) * t.sign;
    netByDay.set(t.date, (netByDay.get(t.date) ?? 0) + mad);
  }

  // Walk backward from today to reconstruct opening balances
  const pastBalances = new Map<string, number>();
  let cursor = input.todayBalance;
  pastBalances.set(today, roundMoney(cursor));

  for (let i = 0; i < pastDays; i++) {
    const day = addDays(today, -i);
    const prev = addDays(today, -i - 1);
    if (prev < startPast) break;
    // balance(prev) + net(day) ≈ balance(day)  →  balance(prev) = balance(day) - net(day)
    // Using net on `day` as flows that produced today's balance when going back one step
    const net = netByDay.get(day) ?? 0;
    cursor = roundMoney(cursor - net);
    pastBalances.set(prev, cursor);
  }

  const series: {
    date: string;
    balance: number;
    phase: "past" | "today" | "future";
  }[] = [];

  for (let i = pastDays; i >= 1; i--) {
    const date = addDays(today, -i);
    if (date < startPast) continue;
    series.push({
      date,
      balance: pastBalances.get(date) ?? cursor,
      phase: "past",
    });
  }

  series.push({
    date: today,
    balance: roundMoney(input.todayBalance),
    phase: "today",
  });

  for (const p of input.futurePoints) {
    if (p.date <= today) continue;
    series.push({
      date: p.date,
      balance: p.balance,
      phase: "future",
    });
  }

  return series;
}
