import { createClient } from "@/lib/supabase/server";
import { toMad } from "@/lib/calc/money";
import { periodMonthKey } from "@/lib/calc/pay-cycle";

/**
 * Sum of active recurring *expenses* that are not yet paid or skipped
 * for the current calendar month period.
 */
export async function getUnpaidRecurringExpenseMad(): Promise<number> {
  const supabase = await createClient();
  const period = periodMonthKey();

  const [{ data: items }, { data: occurrences }] = await Promise.all([
    supabase
      .from("recurring_items")
      .select("id, amount, rate_to_mad")
      .eq("active", true)
      .eq("kind", "expense"),
    supabase
      .from("recurring_occurrences")
      .select("recurring_item_id, status")
      .eq("period_month", period),
  ]);

  const settled = new Set(
    (occurrences ?? [])
      .filter((o) => o.status === "paid" || o.status === "skipped")
      .map((o) => o.recurring_item_id)
  );

  return (items ?? [])
    .filter((i) => !settled.has(i.id))
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);
}
