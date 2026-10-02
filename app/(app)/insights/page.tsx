import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { calcInsights } from "@/lib/calc/insights";
import { calcWhatChanged } from "@/lib/calc/what-changed";
import { formatMoney } from "@/lib/format";
import { CategoryChart } from "@/features/insights/components/CategoryChart";
import { CategoryLegend } from "@/features/insights/components/CategoryLegend";
import { MonthlyChart } from "@/features/insights/components/MonthlyChart";
import { buildWeeklyReview } from "@/lib/calc/weekly-review";

async function InsightsContent() {
  const supabase = await createClient();

  const [{ data: expenses }, { data: income }] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, rate_to_mad, status, spent_on, categories(name, bucket)"),
    supabase.from("income").select("amount, rate_to_mad, received_at"),
  ]);

  const insights = calcInsights(expenses ?? [], income ?? []);
  const changed = calcWhatChanged(expenses ?? []);
  const review = buildWeeklyReview(expenses ?? [], income ?? []);
  // Template only — no Groq on first paint (faster)
  const lines = review.lines;

  return (
    <div className="space-y-4">
      <section className="glass rounded-2xl p-4">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">This week</p>
        <ul className="mt-2 space-y-1">
          {lines.map((line) => (
            <li key={line} className="text-sm">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Spent</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatMoney(insights.spentThisMonth)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Income</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[hsl(var(--primary))]">
            {formatMoney(insights.incomeThisMonth)}
          </p>
        </div>
      </section>

      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Net this month</p>
        <p
          className={`mt-1 text-2xl font-semibold tabular-nums ${
            insights.netThisMonth >= 0
              ? "text-[hsl(var(--primary))]"
              : "text-red-600"
          }`}
        >
          {insights.netThisMonth >= 0 ? "+" : ""}
          {formatMoney(insights.netThisMonth)}
        </p>
      </div>

      <section className="glass rounded-2xl p-4">
        <h2 className="text-sm font-medium">By category</h2>
        <CategoryChart data={insights.byCategory} />
        <CategoryLegend data={insights.byCategory} />
      </section>

      <section className="glass rounded-2xl p-4">
        <h2 className="text-sm font-medium">Last 6 months</h2>
        <div className="mt-2">
          <MonthlyChart data={insights.monthly} />
        </div>
      </section>

      <section className="glass rounded-2xl p-4">
        <h2 className="text-sm font-medium">What changed?</h2>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          This month vs last month
        </p>
        {changed.length === 0 ? (
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            Not enough history yet
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
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
        )}
      </section>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/40" />
      ))}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Trends · what changed
        </p>
      </div>
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsContent />
      </Suspense>
    </div>
  );
}
