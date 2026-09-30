import { describe, it, expect } from "vitest";
import { calcSafeToSpend } from "./safe-to-spend";

describe("calcSafeToSpend", () => {
  it("computes monthly free amount and daily share", () => {
    const income = [
      { amount: 3000, received_at: "2026-09-01", rate_to_mad: 1 },
    ];
    const expenses = [
      { amount: 500, status: "actual" as const, rate_to_mad: 1 },
      { amount: 200, status: "planned" as const, rate_to_mad: 1 },
    ];
    // Fixed date: 15 Sep 2026 → 16 days left in month (15..30 inclusive)
    const now = new Date(2026, 8, 15); // month is 0-indexed
    const result = calcSafeToSpend(income, expenses, 100, 0, 0, now);

    expect(result.received).toBe(3000);
    expect(result.actual).toBe(500);
    expect(result.planned).toBe(200);
    expect(result.cart).toBe(100);
    expect(result.monthly).toBe(2200); // 3000 - 500 - 200 - 100
    expect(result.daysLeft).toBe(16);
    expect(result.daily).toBe(137.5); // 2200 / 16
  });
});
