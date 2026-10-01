import { describe, it, expect } from "vitest";
import { projectTimeline } from "./timeline";

describe("projectTimeline", () => {
  it("starts at startBalance and applies future events", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const result = projectTimeline(
      5000,
      [
        {
          date: "2026-10-05",
          amount: -1000,
          kind: "bill",
          label: "Rent",
        },
        {
          date: "2026-10-20",
          amount: 3000,
          kind: "income",
          label: "Salary",
        },
      ],
      "2026-10-28",
      now
    );

    expect(result.startBalance).toBe(5000);
    // Before rent
    const oct4 = result.points.find((p) => p.date === "2026-10-04");
    expect(oct4?.balance).toBe(5000);
    // After rent
    const oct5 = result.points.find((p) => p.date === "2026-10-05");
    expect(oct5?.balance).toBe(4000);
    expect(result.lowestBalance).toBe(4000);
    expect(result.lowestDate).toBe("2026-10-05");
    // After salary
    const oct20 = result.points.find((p) => p.date === "2026-10-20");
    expect(oct20?.balance).toBe(7000);
  });

  it("ignores events before today", () => {
    const now = new Date("2026-10-10T12:00:00Z");
    const result = projectTimeline(
      2000,
      [
        {
          date: "2026-10-01",
          amount: -500,
          kind: "bill",
          label: "Old",
        },
      ],
      "2026-10-15",
      now
    );
    expect(result.lowestBalance).toBe(2000);
  });
});
