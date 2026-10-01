import { describe, it, expect } from "vitest";
import { calcSafeToSpend } from "./safe-to-spend";

describe("calcSafeToSpend", () => {
  it("subtracts unpaid recurring, buffer, and uses pay-cycle days", () => {
    const income = [
      { amount: 3000, received_at: "2026-09-26", rate_to_mad: 1 },
    ];
    const expenses = [
      { amount: 500, status: "actual" as const, rate_to_mad: 1 },
      { amount: 200, status: "planned" as const, rate_to_mad: 1 },
    ];

    const result = calcSafeToSpend(income, expenses, {
      cartTotalMad: 100,
      unpaidRecurringMad: 300,
      goalReservesMad: 0,
      safetyBufferMad: 400,
      daysLeft: 10,
    });

    // 3000 - 500 - 200 - 100 - 300 - 0 - 400 = 1500
    expect(result.monthly).toBe(1500);
    expect(result.daysLeft).toBe(10);
    expect(result.daily).toBe(150);
    expect(result.safetyBuffer).toBe(400);
    expect(result.recurring).toBe(300);
  });
});
