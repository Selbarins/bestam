import { createClient } from "@/lib/supabase/server";
import { calcBalance } from "@/lib/calc/balance";
import { calcPayCycle, periodMonthKey } from "@/lib/calc/pay-cycle";
import { buildTimelineEvents } from "@/lib/calc/build-events";
import { calcSafeToSpendV2 } from "@/lib/calc/safe-to-spend-v2";
import { getAccounts } from "@/features/accounts/queries";
import { getSettings } from "@/features/settings/queries";
import { buildGoalEvents, detectGoalConflicts } from "@/lib/calc/goal-events";

export type ExpenseRow = {
  id?: string;
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: "actual" | "planned";
  spent_on?: string | null;
  note?: string | null;
  account_id?: string | null;
  category_id?: string | null;
  bucket?: string | null;
};

export type QuickChip = {
  note: string;
  amount: number;
  category_id: string | null;
  count: number;
};

export async function loadSafeToSpendV2() {
  const supabase = await createClient();
  const period = periodMonthKey();

  const [
    { data: income },
    { data: expensesRaw },
    { data: cart },
    { data: recurring },
    { data: occurrences },
    { data: adjustments },
    { data: goals },
    accounts,
    settings,
  ] = await Promise.all([
    supabase
      .from("income")
      .select(
        "id, amount, rate_to_mad, received_at, expected_on, is_salary, name, account_id"
      ),
    supabase
      .from("expenses")
      .select(
        "id, amount, rate_to_mad, status, spent_on, note, account_id, category_id, categories(bucket)"
      )
      .order("spent_on", { ascending: false })
      .limit(400),
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
    supabase
      .from("goals")
      .select("id, type, name, target_amount, current_amount, target_date"),
    getAccounts(),
    getSettings(),
  ]);

    const expenses: ExpenseRow[] = (expensesRaw ?? []).map((row) => {
    const cat = row.categories as
      | { bucket?: string }
      | { bucket?: string }[]
      | null;
    let bucket: string | null = null;
    if (Array.isArray(cat)) bucket = cat[0]?.bucket ?? null;
    else if (cat) bucket = cat.bucket ?? null;

    const status: "actual" | "planned" =
      row.status === "planned" ? "planned" : "actual";

    return {
      id: row.id,
      amount: row.amount,
      rate_to_mad: row.rate_to_mad,
      status,
      spent_on: row.spent_on,
      note: row.note,
      account_id: row.account_id,
      category_id: row.category_id,
      bucket,
    };
  });

  let startBalance = 0;
  for (const a of accounts) {
    if (!a.include_in_safe_to_spend) continue;
    startBalance += calcBalance(income ?? [], expenses, adjustments ?? [], {
      accountId: a.id,
      includeUnassigned: a.type === "bank",
    });
  }
  if (accounts.length === 0) {
    startBalance = calcBalance(income ?? [], expenses, adjustments ?? []);
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

  const goalEvents = buildGoalEvents(goals ?? [], cycle.cycleEnd);
  const conflicts = detectGoalConflicts(goalEvents, startBalance);

  const baseEvents = buildTimelineEvents({
    income: income ?? [],
    expenses,
    recurring: recurring ?? [],
    occurrences: occurrences ?? [],
    cart: cart ?? [],
    goalReservesMad: 0,
    endDate: cycle.cycleEnd,
  });

  const events = [...baseEvents, ...goalEvents];

  const safe = calcSafeToSpendV2({
    startBalance,
    events,
    endDate: cycle.cycleEnd,
    safetyBuffer: settings.safety_buffer,
  });

  // Latest actuals for home
  const latest = expenses
    .filter((e) => e.status === "actual")
    .slice(0, 5);

  // Quick chips: most common note+amount in last ~90 days of actuals
  const chips = buildQuickChips(expenses);

  return {
    safe,
    cycle,
    accounts,
    settings,
    startBalance,
    events,
    income: income ?? [],
    expenses,
    adjustments: adjustments ?? [],
    goals: goals ?? [],
    conflicts,
    latest,
    chips,
  };
}

function buildQuickChips(expenses: ExpenseRow[]): QuickChip[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cut = cutoff.toISOString().slice(0, 10);

  const map = new Map<string, QuickChip>();

  for (const e of expenses) {
    if (e.status !== "actual") continue;
    if (!e.spent_on || e.spent_on < cut) continue;
    const note = (e.note || "").trim();
    if (!note) continue;
    const amount = Math.round(Number(e.amount) * 100) / 100;
    if (!(amount > 0)) continue;
    const key = `${note.toLowerCase()}|${amount}`;
    const prev = map.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      map.set(key, {
        note,
        amount,
        category_id: e.category_id ?? null,
        count: 1,
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
