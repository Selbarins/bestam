import { createClient } from "@/lib/supabase/server";
import { calcBalance } from "@/lib/calc/balance";
import { calcPayCycle, periodMonthKey } from "@/lib/calc/pay-cycle";
import { buildTimelineEvents } from "@/lib/calc/build-events";
import { calcSafeToSpendV2 } from "@/lib/calc/safe-to-spend-v2";
import { getAccounts } from "@/features/accounts/queries";
import { getSettings } from "@/features/settings/queries";
import { getGoalReservesMad } from "@/features/goals/actions";

export async function loadSafeToSpendV2() {
  const supabase = await createClient();
  const period = periodMonthKey();

  const [
    { data: income },
    { data: expenses },
    { data: cart },
    { data: recurring },
    { data: occurrences },
    { data: adjustments },
    accounts,
    settings,
    goalReserves,
  ] = await Promise.all([
    supabase
      .from("income")
      .select(
        "id, amount, rate_to_mad, received_at, expected_on, is_salary, name, account_id"
      ),
    supabase
      .from("expenses")
      .select(
        "id, amount, rate_to_mad, status, spent_on, note, account_id"
      ),
    supabase
      .from("cart_items")
      .select("id, name, estimated_amount, rate_to_mad"),
    supabase
      .from("recurring_items")
      .select("id, kind, name, amount, rate_to_mad, day_of_month, active")
      .eq("active", true),
    supabase
      .from("recurring_occurrences")
      .select("recurring_item_id, status, period_month")
      .eq("period_month", period),
    supabase.from("adjustments").select("amount, account_id"),
    getAccounts(),
    getSettings(),
    getGoalReservesMad(),
  ]);

  // Book balance for accounts included in Safe-to-Spend
  const spendableIds = new Set(
    accounts.filter((a) => a.include_in_safe_to_spend).map((a) => a.id)
  );

  // Overall book for spendable: sum per spendable account
  // Unassigned rows count toward bank (legacy)
  let startBalance = 0;
  for (const a of accounts) {
    if (!a.include_in_safe_to_spend) continue;
    startBalance += calcBalance(
      income ?? [],
      expenses ?? [],
      adjustments ?? [],
      {
        accountId: a.id,
        includeUnassigned: a.type === "bank",
      }
    );
  }
  // If no accounts yet, fall back to simple total
  if (accounts.length === 0) {
    startBalance = calcBalance(
      income ?? [],
      expenses ?? [],
      adjustments ?? []
    );
  }

  const lastSalary = (income ?? [])
    .filter((i) => i.received_at && i.is_salary)
    .sort((a, b) =>
      String(b.received_at).localeCompare(String(a.received_at))
    )[0];

  const cycle = calcPayCycle(
    lastSalary?.received_at ?? null,
    settings.pay_cycle_days
  );

  const events = buildTimelineEvents({
    income: income ?? [],
    expenses: expenses ?? [],
    recurring: recurring ?? [],
    occurrences: occurrences ?? [],
    cart: cart ?? [],
    goalReservesMad: goalReserves,
    endDate: cycle.cycleEnd,
  });

  const safe = calcSafeToSpendV2({
    startBalance,
    events,
    endDate: cycle.cycleEnd,
    safetyBuffer: settings.safety_buffer,
  });

  return {
    safe,
    cycle,
    accounts,
    settings,
    startBalance,
    events,
    income: income ?? [],
    expenses: expenses ?? [],
    adjustments: adjustments ?? [],
    spendableIds,
  };
}
