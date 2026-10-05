import { describe, it, expect } from "vitest";
import { calcSpendingPace } from "./pace";

describe("calcSpendingPace", () => {
  it("flags ahead when income is spent faster than time", () => {
    // 8/28 ≈ 0.29 time; spent 800 / income 1000 = 0.80 → ahead
    const r = calcSpendingPace({
      spentInCycle: 800,
      incomeInCycle: 1000,
      daysLeft: 20,
      daysInCycle: 28,
    });
    expect(r.status).toBe("ahead");
    expect(r.usedRatio).toBeGreaterThan(r.timeElapsedRatio);
  });

  it("on track when ratios are close", () => {
    // 10/28 ≈ 0.36; spent 360 / 1000 = 0.36
    const r = calcSpendingPace({
      spentInCycle: 360,
      incomeInCycle: 1000,
      daysLeft: 18,
      daysInCycle: 28,
    });
    expect(r.status).toBe("on_track");
  });

  it("flags under when little of income is spent vs time", () => {
    const r = calcSpendingPace({
      spentInCycle: 100,
      incomeInCycle: 2000,
      daysLeft: 14,
      daysInCycle: 28,
    });
    expect(r.status).toBe("under");
  });
});
