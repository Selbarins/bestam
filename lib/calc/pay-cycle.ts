/**
 * Pay cycle is driven by the last *received* salary date + N days
 * (default 28), not the calendar month.
 */

export type PayCycle = {
  /** ISO date of last received salary, or null if none */
  lastSalaryDate: string | null;
  /** Start of current cycle (same as last salary day, or today if none) */
  cycleStart: string;
  /** Expected next payday = cycleStart + payCycleDays */
  cycleEnd: string;
  /** Days remaining in cycle (at least 1) */
  daysLeft: number;
  payCycleDays: number;
};

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T12:00:00").getTime();
  const b = new Date(toIso + "T12:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * @param lastSalaryReceivedAt - ISO timestamptz or date of last salary with received_at set
 * @param payCycleDays - from settings (default 28)
 * @param now - injectable for tests
 */
export function calcPayCycle(
  lastSalaryReceivedAt: string | null | undefined,
  payCycleDays = 28,
  now = new Date()
): PayCycle {
  const today = toIsoDate(now);
  const days = Math.min(45, Math.max(14, Math.round(payCycleDays) || 28));

  if (!lastSalaryReceivedAt) {
    return {
      lastSalaryDate: null,
      cycleStart: today,
      cycleEnd: addDays(today, days),
      daysLeft: days,
      payCycleDays: days,
    };
  }

  const lastSalaryDate = lastSalaryReceivedAt.slice(0, 10);
  let cycleStart = lastSalaryDate;
  let cycleEnd = addDays(cycleStart, days);

  // If we're past the expected end, roll forward in steps of payCycleDays
  while (cycleEnd < today) {
    cycleStart = cycleEnd;
    cycleEnd = addDays(cycleStart, days);
  }

  const daysLeft = Math.max(1, daysBetween(today, cycleEnd));

  return {
    lastSalaryDate,
    cycleStart,
    cycleEnd,
    daysLeft,
    payCycleDays: days,
  };
}

/** First day of calendar month for occurrence tracking: YYYY-MM-01 */
export function periodMonthKey(from = new Date()): string {
  const y = from.getFullYear();
  const m = String(from.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
