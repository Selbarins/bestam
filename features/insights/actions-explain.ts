"use server";

import { createClient } from "@/lib/supabase/server";
import { calcInsights } from "@/lib/calc/insights";
import { calcWhatChanged } from "@/lib/calc/what-changed";
import {
  polishMonthExplain,
  templateMonthExplain,
} from "@/lib/calc/ai-explain";

export async function explainThisMonth(): Promise<
  { text: string } | { error: string }
> {
  const supabase = await createClient();

  const [{ data: expenses }, { data: income }] = await Promise.all([
    supabase
      .from("expenses")
      .select(
        "amount, rate_to_mad, status, spent_on, note, categories(name, bucket)"
      ),
    supabase.from("income").select("amount, rate_to_mad, received_at"),
  ]);

  const insights = calcInsights(expenses ?? [], income ?? []);
  const changed = calcWhatChanged(expenses ?? []);

  const facts = {
    spentThisMonth: insights.spentThisMonth,
    incomeThisMonth: insights.incomeThisMonth,
    netThisMonth: insights.netThisMonth,
    spendRate: insights.spendRate,
    topCategories: insights.byCategory.slice(0, 5),
    topDeltas: changed.slice(0, 5).map((c) => ({
      name: c.name,
      delta: c.delta,
    })),
  };

  try {
    const text = await polishMonthExplain(facts);
    return { text };
  } catch {
    return { text: templateMonthExplain(facts) };
  }
}
