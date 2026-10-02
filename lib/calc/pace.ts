import { roundMoney } from "./money";

export type PaceResult = {
  spentInCycle: number;
  startBalance: number;
  /** 0–2: share of spendable balance already spent this cycle */
  usedRatio: number;
  /** 0–1: share of pay cycle elapsed */
  timeElapsedRatio: number;
  paceDelta: number;
  daysElapsed: number;
  daysInCycle: number;
  daysLeft: number;
  status: "under" | "on_track" | "ahead";
};

/**
 * Pace = cash burn vs time.
 * usedRatio  = spentInCycle / startBalance
 * timeRatio  = daysElapsed / daysInCycle
 */
export function calcSpendingPace(input: {
  spentInCycle: number;
  startBalance: number;
  daysLeft: number;
  daysInCycle: number;
}): PaceResult {
  const daysInCycle = Math.max(1, Math.round(input.daysInCycle));
  const daysLeft = Math.max(0, Math.round(input.daysLeft));
  const daysElapsed = Math.max(0, daysInCycle - daysLeft);

  const startBalance = roundMoney(Math.max(0, input.startBalance));
  const spent = roundMoney(Math.max(0, input.spentInCycle));

  const usedRatio =
    startBalance > 0 ? Math.min(2, spent / startBalance) : spent > 0 ? 1 : 0;
  const timeElapsedRatio = daysElapsed / daysInCycle;
  const paceDelta = usedRatio - timeElapsedRatio;

  let status: PaceResult["status"] = "on_track";
  if (paceDelta > 0.12) status = "ahead";
  else if (paceDelta < -0.12) status = "under";

  return {
    spentInCycle: spent,
    startBalance,
    usedRatio,
    timeElapsedRatio,
    paceDelta,
    daysElapsed,
    daysInCycle,
    daysLeft,
    status,
  };
}
