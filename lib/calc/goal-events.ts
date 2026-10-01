import { roundMoney } from "./money";
import type { TimelineEvent } from "./timeline";

export type GoalRow = {
  id: string;
  type: "savings" | "emergency" | "cap" | string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  target_date?: string | null;
};

/**
 * Turn open savings/emergency goals into outflow events on the timeline.
 * - Savings with a target_date: remaining spread across months until then,
 *   one slice placed on cycle end (simple, visible impact).
 * - Emergency: remaining / 6, placed on cycle end.
 * Caps are not reserves (they track spending, not set-asides).
 */
export function buildGoalEvents(
  goals: GoalRow[],
  endDate: string,
  now = new Date()
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const today = now.toISOString().slice(0, 10);

  for (const g of goals) {
    if (g.type === "cap") continue;

    const target = Number(g.target_amount) || 0;
    const current = Number(g.current_amount) || 0;
    const remaining = Math.max(0, target - current);
    if (remaining <= 0) continue;

    let slice = remaining / 6; // default emergency-style

    if (g.type === "savings" && g.target_date) {
      const end = new Date(g.target_date + "T12:00:00");
      let months =
        (end.getFullYear() - now.getFullYear()) * 12 +
        (end.getMonth() - now.getMonth());
      if (end.getDate() < now.getDate()) months -= 1;
      months = Math.max(1, months);
      slice = remaining / months;
    }

    slice = roundMoney(slice);
    if (slice <= 0) continue;

    const date = endDate >= today ? endDate : today;
    events.push({
      date,
      amount: -slice,
      kind: "goal",
      label: `Goal: ${g.name}`,
      sourceId: g.id,
    });
  }

  return events;
}

/**
 * Detect simple conflicts: two+ goals whose combined cycle set-aside
 * exceeds a share of start balance (informational only).
 */
export function detectGoalConflicts(
  goalEvents: TimelineEvent[],
  startBalance: number
): string[] {
  const total = goalEvents.reduce((s, e) => s + Math.abs(e.amount), 0);
  if (total <= 0 || startBalance <= 0) return [];

  const messages: string[] = [];
  if (total > startBalance * 0.5) {
    messages.push(
      `Goal set-asides this cycle (${roundMoney(total)} MAD) are over half of your spendable balance.`
    );
  }
  if (goalEvents.length >= 2) {
    const names = goalEvents.map((e) => e.label.replace(/^Goal: /, ""));
    messages.push(
      `${names.join(" and ")} both reserve money this cycle — check priorities.`
    );
  }
  return messages;
}
