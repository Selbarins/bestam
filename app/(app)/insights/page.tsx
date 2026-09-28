import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { calcInsights } from "@/lib/calc/insights";
import { formatMoney } from "@/lib/format";
import { CategoryChart } from "@/features/insights/components/CategoryChart";
import { CategoryLegend } from "@/features/insights/components/CategoryLegend";
import { MonthlyChart } from "@/features/insights/components/MonthlyChart";

async function InsightsContent() {
  const supabase = await createClient();

  const [{ data: expenses }, { data: income }] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, rate_to_mad, status, spent_on, categories(name)"),
    supabase.from("income").select("amount, rate_to_mad, received_at"),
  ]);

  const insights = calcInsights(expenses ?? [], income ?? []);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Spent this month
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatMoney(insights.spentThisMonth)}
          </p>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Income this month
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[hsl(var(--primary))]">
            {formatMoney(insights.incomeThisMonth)}
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
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

      {/* By category */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="text-sm font-medium">Spending by category</h2>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          This month
        </p>
        <CategoryChart data={insights.byCategory} />
        <CategoryLegend data={insights.byCategory} />
      </section>

      {/* Monthly trend */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="text-sm font-medium">Monthly spending</h2>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          Last 6 months
        </p>
        <div className="mt-2">
          <MonthlyChart data={insights.monthly} />
        </div>
      </section>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl bg-[hsl(var(--muted))]"
        />
      ))}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Charts · trends · this month
        </p>
      </div>

      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsContent />
      </Suspense>
    </div>
  );
}
