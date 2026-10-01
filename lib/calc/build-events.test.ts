import { describe, it, expect } from "vitest";
import { buildTimelineEvents } from "./build-events";

describe("buildTimelineEvents", () => {
  it("schedules unpaid rent and skips paid ones", () => {
    const now = new Date("2026-10-02T12:00:00Z");
    const events = buildTimelineEvents({
      income: [],
      expenses: [],
      recurring: [
        {
          id: "r1",
          kind: "expense",
          name: "Rent",
          amount: 2000,
          day_of_month: 5,
          active: true,
        },
        {
          id: "r2",
          kind: "expense",
          name: "Netflix",
          amount: 50,
          day_of_month: 10,
          active: true,
        },
      ],
      occurrences: [
        {
          recurring_item_id: "r2",
          status: "paid",
          period_month: "2026-10-01",
        },
      ],
      cart: [],
      endDate: "2026-10-28",
      now,
    });

    const labels = events.map((e) => e.label);
    expect(labels).toContain("Rent");
    expect(labels).not.toContain("Netflix");
    const rent = events.find((e) => e.label === "Rent");
    expect(rent?.date).toBe("2026-10-05");
    expect(rent?.amount).toBe(-2000);
  });
});
