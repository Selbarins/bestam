import { describe, it, expect } from "vitest";
import {
  calcSafeToSpendV2,
  calcSafeToSpendV2WithPurchase,
} from "./safe-to-spend-v2";

describe("calcSafeToSpendV2", () => {
  it("rent before payday tightens the lowest point", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const result = calcSafeToSpendV2({
      startBalance: 5000,
      endDate: "2026-10-28",
      safetyBuffer: 1000,
      now,
      events: [
        {
          date: "2026-10-05",
          amount: -2000,
          kind: "bill",
          label: "Rent",
        },
        {
          date: "2026-10-26",
          amount: 8000,
          kind: "income",
          label: "Salary",
        },
      ],
    });

    // Lowest after rent = 3000; discretionary = 3000 - 1000 = 2000
    expect(result.lowestBalance).toBe(3000);
    expect(result.lowestDate).toBe("2026-10-05");
    expect(result.discretionary).toBe(2000);
    expect(result.daysLeft).toBe(27); // Oct 1 → Oct 28
    expect(result.daily).toBe(round2(2000 / 27));
  });

  it("purchase injection lowers daily STS", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const base = {
      startBalance: 5000,
      endDate: "2026-10-28",
      safetyBuffer: 0,
      now,
      events: [] as const,
    };
    const before = calcSafeToSpendV2({ ...base, events: [] });
    const after = calcSafeToSpendV2WithPurchase(
      { ...base, events: [] },
      { amount: 900, date: "2026-10-02", label: "Headphones" }
    );
    expect(after.lowestBalance).toBe(4100);
    expect(after.daily).toBeLessThan(before.daily);
  });
});

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
