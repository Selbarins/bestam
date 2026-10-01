import { describe, it, expect } from "vitest";
import { calcRunway } from "./runway";

describe("calcRunway", () => {
  it("divides balance by average monthly spend", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    const expenses = [
      {
        amount: 3000,
        status: "actual",
        spent_on: "2026-09-10",
        bucket: "essentials",
      },
      {
        amount: 1000,
        status: "actual",
        spent_on: "2026-09-12",
        bucket: "lifestyle",
      },
    ];
    // 3-month window, one month of data → averages are total/3
    const r = calcRunway(6000, expenses, now, 3);
    expect(r.avgLifestyleMonthly).toBe(round2(4000 / 3));
    expect(r.lifestyleMonths).toBeGreaterThan(0);
  });
});

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
