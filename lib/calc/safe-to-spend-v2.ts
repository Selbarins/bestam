import { roundMoney } from "./money";
import {
  projectTimeline,
  type TimelineEvent,
  type TimelineResult,
} from "./timeline";

export type SafeToSpendV2Result = {
  /** Max(0, discretionary) / days until next income (or horizon) */
  daily: number;
  /** lowestBalance − safetyBuffer */
  discretionary: number;
  lowestBalance: number;
  lowestDate: string | null;
  safetyBuffer: number;
  daysLeft: number;
  startBalance: number;
  cycleEnd: string;
  timeline: TimelineResult;
};

export type SafeToSpendV2Input = {
  /** Available cash today (Bank + Cash book balances, etc.) */
  startBalance: number;
  /** Future events only */
  events: TimelineEvent[];
  /** Usually next payday / cycle end */
  endDate: string;
  safetyBuffer?: number;
  now?: Date;
};

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T12:00:00").getTime();
  const b = new Date(toIso + "T12:00:00").getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

/**
 * Timeline-based Safe-to-Spend:
 * 1. Project day-by-day until endDate
 * 2. Find lowest projected balance
 * 3. discretionary = lowest − buffer
 * 4. daily = max(0, discretionary) / days left
 */
export function calcSafeToSpendV2(
  input: SafeToSpendV2Input
): SafeToSpendV2Result {
  const {
    startBalance,
    events,
    endDate,
    safetyBuffer = 0,
    now = new Date(),
  } = input;

  const timeline = projectTimeline(startBalance, events, endDate, now);
  const buffer = roundMoney(Math.max(0, safetyBuffer));
  const discretionary = roundMoney(timeline.lowestBalance - buffer);
  const today = toIso(now);
  const daysLeft = daysBetween(today, endDate);
  const daily = roundMoney(Math.max(0, discretionary) / daysLeft);

  return {
    daily,
    discretionary,
    lowestBalance: timeline.lowestBalance,
    lowestDate: timeline.lowestDate,
    safetyBuffer: buffer,
    daysLeft,
    startBalance: timeline.startBalance,
    cycleEnd: endDate,
    timeline,
  };
}

/**
 * Same engine with an extra purchase injected (for "Can I afford this?").
 * Does not mutate the original events array.
 */
export function calcSafeToSpendV2WithPurchase(
  input: SafeToSpendV2Input,
  purchase: { amount: number; date: string; label?: string }
): SafeToSpendV2Result {
  const amount = -Math.abs(Number(purchase.amount) || 0);
  const events: TimelineEvent[] = [
    ...input.events,
    {
      date: purchase.date,
      amount,
      kind: "purchase",
      label: purchase.label || "Purchase",
    },
  ];
  return calcSafeToSpendV2({ ...input, events });
}
