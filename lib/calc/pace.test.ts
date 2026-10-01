import { describe, it, expect } from "vitest";
import { calcSpendingPace } from "./pace";

describe("calcSpendingPace", () => {
  it("flags ahead when spend outruns time", () => {
    const r = calcSpendingPace({
      spentInCycle: 800,
      dailySafe: 50,
      daysLeft: 20,
      daysInCycle: 28,
    });
    // budget = 50*28 = 1400; used = 800/1400 ≈ 0.57; time = 8/28 ≈ 0.29
    expect(r.status).toBe("ahead");
    expect(r.usedRatio).toBeGreaterThan(r.timeElapsedRatio);
  });

  it("on track when ratios are close", () => {
    const r = calcSpendingPace({
      spentInCycle: 500,
      dailySafe: 50,
      daysLeft: 18,
      daysInCycle: 28,
    });
    // time elapsed 10/28 ≈ 0.36; used 500/1400 ≈ 0.36
    expect(r.status).toBe("on_track");
  });
});
