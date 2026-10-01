import { describe, it, expect } from "vitest";
import { buildGoalEvents, detectGoalConflicts } from "./goal-events";

describe("buildGoalEvents", () => {
  it("creates a savings slice before target date", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const events = buildGoalEvents(
      [
        {
          id: "g1",
          type: "savings",
          name: "Laptop",
          target_amount: 6000,
          current_amount: 0,
          target_date: "2027-04-01",
        },
      ],
      "2026-10-28",
      now
    );
    expect(events).toHaveLength(1);
    expect(events[0].label).toContain("Laptop");
    expect(events[0].amount).toBeLessThan(0);
  });

  it("skips caps and completed goals", () => {
    const events = buildGoalEvents(
      [
        {
          id: "c1",
          type: "cap",
          name: "Dining",
          target_amount: 500,
          current_amount: 0,
        },
        {
          id: "g2",
          type: "savings",
          name: "Done",
          target_amount: 100,
          current_amount: 100,
        },
      ],
      "2026-10-28"
    );
    expect(events).toHaveLength(0);
  });
});

describe("detectGoalConflicts", () => {
  it("flags heavy set-asides", () => {
    const msgs = detectGoalConflicts(
      [
        {
          date: "2026-10-28",
          amount: -800,
          kind: "goal",
          label: "Goal: A",
        },
        {
          date: "2026-10-28",
          amount: -800,
          kind: "goal",
          label: "Goal: B",
        },
      ],
      2000
    );
    expect(msgs.length).toBeGreaterThan(0);
  });
});
