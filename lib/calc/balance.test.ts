import { describe, it, expect } from "vitest";
import { calcBalance, calcReconcileDelta } from "./balance";

describe("calcBalance", () => {
  it("sums received income minus actual expenses", () => {
    const income = [
      { amount: 1000, received_at: "2026-09-01", rate_to_mad: 1 },
      { amount: 500, received_at: null, rate_to_mad: 1 },
    ];
    const expenses = [
      { amount: 200, status: "actual" as const, rate_to_mad: 1 },
      { amount: 50, status: "planned" as const, rate_to_mad: 1 },
    ];
    expect(calcBalance(income, expenses)).toBe(800);
  });

  it("adds adjustments", () => {
    const income = [
      { amount: 1000, received_at: "2026-09-01", rate_to_mad: 1 },
    ];
    const expenses = [
      { amount: 200, status: "actual" as const, rate_to_mad: 1 },
    ];
    const adjustments = [{ amount: -50 }];
    expect(calcBalance(income, expenses, adjustments)).toBe(750);
  });

  it("returns 0 with empty data", () => {
    expect(calcBalance([], [])).toBe(0);
  });
});

describe("calcReconcileDelta", () => {
  it("real higher than book → positive adjustment", () => {
    expect(calcReconcileDelta(800, 850)).toBe(50);
  });

  it("real lower than book → negative adjustment", () => {
    expect(calcReconcileDelta(800, 750)).toBe(-50);
  });

  it("already matched → 0", () => {
    expect(calcReconcileDelta(800, 800)).toBe(0);
  });
});
