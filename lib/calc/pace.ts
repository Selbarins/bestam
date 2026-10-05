import { roundMoney } from "./money";

export type PaceResult = {
  spentInCycle: number;
  /** Received income in this pay cycle (denominator) */
  incomeInCycle: number;
  /** spent / income (capped at 2 for UI) */
  usedRatio: number;
  /** days elapsed / days in cycle */
  timeElapsedRatio: number;
  paceDelta: number;
  daysElapsed: number;
  daysInCycle: number;
  daysLeft: number;
  status: "under" | "on_track" | "ahead";
};

/**
 * Pace = share of cycle income already spent, vs share of cycle time elapsed.
 * usedRatio = spentInCycle / incomeInCycle
 * timeRatio = daysElapsed / daysInCycle
 *
 * Example: 50% of income spent but only 30% of cycle elapsed → ahead.
 */
export function calcSpendingPace(input: {
  spentInCycle: number;
  incomeInCycle: number;
  daysLeft: number;
  daysInCycle: number;
}): PaceResult {
  const daysInCycle = Math.max(1, Math.round(input.daysInCycle));
  const daysLeft = Math.max(0, Math.round(input.daysLeft));
  const daysElapsed = Math.max(0, daysInCycle - daysLeft);

  const income = roundMoney(Math.max(0, input.incomeInCycle));
  const spent = roundMoney(Math.max(0, input.spentInCycle));

  const usedRatio =
    income > 0 ? Math.min(2, spent / income) : spent > 0 ? 1 : 0;
  const timeElapsedRatio = daysElapsed / daysInCycle;
  const paceDelta = usedRatio - timeElapsedRatio;

  let status: PaceResult["status"] = "on_track";
  if (paceDelta > 0.12) status = "ahead";
  else if (paceDelta < -0.12) status = "under";

  return {
    spentInCycle: spent,
    incomeInCycle: income,
    usedRatio,
    timeElapsedRatio,
    paceDelta,
    daysElapsed,
    daysInCycle,
    daysLeft,
    status,
  };
}
