import { roundMoney } from "./money";

export type PaceResult = {
  /** Actual spending in the current pay cycle */
  spentInCycle: number;
  /** Flexible pool roughly: start discretionary at cycle start ≈ daily * days in full cycle */
  flexibleBudget: number;
  /** 0–1 fraction of flexible budget already spent */
  usedRatio: number;
  /** 0–1 fraction of pay cycle elapsed */
  timeElapsedRatio: number;
  /** usedRatio - timeElapsedRatio; positive = ahead of pace (spending fast) */
  paceDelta: number;
  daysElapsed: number;
  daysInCycle: number;
  status: "under" | "on_track" | "ahead";
};

/**
 * Compare spending speed to time elapsed in the pay cycle.
 * flexibleBudget = max(0, dailySafe * daysInCycle) as a simple proxy for
 * "what you can spend this cycle if you stay on the STS number."
 */
export function calcSpendingPace(input: {
  spentInCycle: number;
  dailySafe: number;
  daysLeft: number;
  daysInCycle: number;
}): PaceResult {
  const daysInCycle = Math.max(1, Math.round(input.daysInCycle));
  const daysLeft = Math.max(0, Math.round(input.daysLeft));
  const daysElapsed = Math.max(0, daysInCycle - daysLeft);

  const flexibleBudget = roundMoney(
    Math.max(0, input.dailySafe) * daysInCycle
  );
  const spent = roundMoney(Math.max(0, input.spentInCycle));

  const usedRatio =
    flexibleBudget > 0 ? Math.min(2, spent / flexibleBudget) : spent > 0 ? 1 : 0;
  const timeElapsedRatio = daysElapsed / daysInCycle;
  const paceDelta = usedRatio - timeElapsedRatio;

  let status: PaceResult["status"] = "on_track";
  if (paceDelta > 0.1) status = "ahead";
  else if (paceDelta < -0.1) status = "under";

  return {
    spentInCycle: spent,
    flexibleBudget,
    usedRatio,
    timeElapsedRatio,
    paceDelta,
    daysElapsed,
    daysInCycle,
    status,
  };
}
