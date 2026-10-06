import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { calcInsights } from "@/lib/calc/insights";
import { calcWhatChanged } from "@/lib/calc/what-changed";
import { formatMoney } from "@/lib/format";
import { IncomeSpendChart } from "@/features/insights/components/IncomeSpendChart";
import { CategoryExplorer } from "@/features/insights/components/CategoryExplorer";

async function InsightsContent() {
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
  const changed = calcWhatChanged(expenses ?? []).slice(0, 3);

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const explorerExpenses = (expenses ?? []).map((e) => {
    const cat = e.categories as
      | { name?: string }
      | { name?: string }[]
      | null;
    const categoryName = Array.isArray(cat)
      ? cat[0]?.name || "Other"
      : cat?.name || "Other";
    return {
      amount: e.amount,
      rate_to_mad: e.rate_to_mad,
      status: e.status,
      spent_on: e.spent_on,
      note: e.note,
      categoryName,
    };
  });

  const pairs = insights.monthlyPairs ?? [];

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <section className="glass grid grid-cols-3 gap-2 rounded-2xl p-3">
        <div className="text-center">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Spent</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(insights.spentThisMonth)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Income</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[hsl(var(--primary))]">
            {formatMoney(insights.incomeThisMonth)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Net</p>
          <p
            className={`mt-0.5 text-sm font-semibold tabular-nums ${
              insights.netThisMonth >= 0
                ? "text-[hsl(var(--primary))]"
                : "text-red-600"
            }`}
          >
            {insights.netThisMonth >= 0 ? "+" : ""}
            {formatMoney(insights.netThisMonth)}
          </p>
        </div>
        {insights.spendRate != null && (
          <p className="col-span-3 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
            {insights.spendRate}% of income spent this month
          </p>
        )}
      </section>

      {/* Trend */}
      <section className="glass rounded-2xl p-4">
        <h2 className="text-sm font-medium">Income vs spend</h2>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          Last 6 months
        </p>
        <div className="mt-2">
          {pairs.length > 0 ? (
            <IncomeSpendChart data={pairs} />
          ) : (
            <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Not enough history
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="glass rounded-2xl p-4">
        <h2 className="text-sm font-medium">Categories</h2>
        <p className="mb-2 text-[11px] text-[hsl(var(--muted-foreground))]">
          Tap a category for daily detail
        </p>
        <CategoryExplorer
          categories={insights.byCategory}
          expenses={explorerExpenses}
          monthPrefix={monthPrefix}
        />
      </section>

      {/* Deltas */}
      {changed.length > 0 && (
        <section className="glass rounded-2xl p-4">
          <h2 className="text-sm font-medium">vs last month</h2>
          <ul className="mt-2 space-y-2">
            {changed.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{r.name}</span>
                <span
                  className={`tabular-nums font-medium ${
                    r.delta > 0
                      ? "text-amber-700"
                      : r.delta < 0
                        ? "text-[hsl(var(--primary))]"
                        : ""
                  }`}
                >
                  {r.delta > 0 ? "+" : ""}
                  {formatMoney(r.delta)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-2xl bg-white/40" />
      <div className="h-48 animate-pulse rounded-2xl bg-white/40" />
      <div className="h-40 animate-pulse rounded-2xl bg-white/40" />
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          This month · trends
        </p>
      </div>
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsContent />
      </Suspense>
    </div>
  );
}
