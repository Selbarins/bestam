import { describe, it, expect } from "vitest";
import { calcSpendingPace } from "./pace";

describe("calcSpendingPace", () => {
  it("flags ahead when cash used outruns time", () => {
    // 8 days elapsed of 28 → time ≈ 0.29
    // spent 800 / balance 1000 → used = 0.80 → ahead
    const r = calcSpendingPace({
      spentInCycle: 800,
      startBalance: 1000,
      daysLeft: 20,
      daysInCycle: 28,
    });
    expect(r.status).toBe("ahead");
    expect(r.usedRatio).toBeGreaterThan(r.timeElapsedRatio);
  });

  it("on track when ratios are close", () => {
    // 10 days elapsed of 28 → time ≈ 0.357
    // spent 360 / balance 1000 → used = 0.36 → on_track
    const r = calcSpendingPace({
      spentInCycle: 360,
      startBalance: 1000,
      daysLeft: 18,
      daysInCycle: 28,
    });
    expect(r.status).toBe("on_track");
  });

  it("flags under when little cash used vs time", () => {
    // 14 days elapsed of 28 → time = 0.5
    // spent 100 / balance 2000 → used = 0.05 → under
    const r = calcSpendingPace({
      spentInCycle: 100,
      startBalance: 2000,
      daysLeft: 14,
      daysInCycle: 28,
    });
    expect(r.status).toBe("under");
  });
});
