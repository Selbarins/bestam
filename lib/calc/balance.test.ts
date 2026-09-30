import { describe, it, expect } from "vitest";
import { calcBalance } from "./balance";

describe("calcBalance", () => {
  it("sums received income minus actual expenses", () => {
    const income = [
      { amount: 1000, received_at: "2026-09-01", rate_to_mad: 1 },
      { amount: 500, received_at: null, rate_to_mad: 1 }, // not received
    ];
    const expenses = [
      { amount: 200, status: "actual" as const, rate_to_mad: 1 },
      { amount: 50, status: "planned" as const, rate_to_mad: 1 }, // ignored
    ];
    expect(calcBalance(income, expenses)).toBe(800);
  });

  it("returns 0 with empty data", () => {
    expect(calcBalance([], [])).toBe(0);
  });
});
