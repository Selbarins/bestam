import { describe, it, expect } from "vitest";
import { calcPayCycle, periodMonthKey } from "./pay-cycle";

describe("calcPayCycle", () => {
  it("uses today when no salary yet", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const c = calcPayCycle(null, 28, now);
    expect(c.cycleStart).toBe("2026-10-01");
    expect(c.cycleEnd).toBe("2026-10-29");
    expect(c.daysLeft).toBe(28);
  });

  it("anchors on last salary and rolls forward", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    // Salary on 26 Sep → cycle ends 24 Oct
    const c = calcPayCycle("2026-09-26", 28, now);
    expect(c.lastSalaryDate).toBe("2026-09-26");
    expect(c.cycleStart).toBe("2026-09-26");
    expect(c.cycleEnd).toBe("2026-10-24");
    expect(c.daysLeft).toBe(9);
  });
});

describe("periodMonthKey", () => {
  it("returns first of month", () => {
    expect(periodMonthKey(new Date("2026-10-15T12:00:00Z"))).toBe(
      "2026-10-01"
    );
  });
});
