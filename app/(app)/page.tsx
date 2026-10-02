import { Suspense } from "react";
import Link from "next/link";
import { calcBalance } from "@/lib/calc/balance";
import { calcSpendingPace } from "@/lib/calc/pace";
import { buildBalanceSeries } from "@/lib/calc/balance-history";
import { formatMoney } from "@/lib/format";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { WalletHero } from "@/features/money/components/WalletHero";
import { BalanceSparkline } from "@/features/money/components/BalanceSparkline";
import { AffordForm } from "@/features/money/components/AffordForm";

async function DashboardNumbers() {
  const data = await loadSafeToSpendV2();
  const { safe, cycle, income, expenses, adjustments } = data;

  const overallBalance = calcBalance(income, expenses, adjustments);

  const spentInCycle = expenses
    .filter(
      (e) =>
        e.status === "actual" &&
        e.spent_on &&
        e.spent_on >= cycle.cycleStart &&
        e.spent_on <= cycle.cycleEnd
    )
    .reduce(
      (s, e) => s + Number(e.amount) * Number(e.rate_to_mad ?? 1),
      0
    );

  const pace = calcSpendingPace({
    spentInCycle,
    startBalance: safe.startBalance,
    daysLeft: safe.daysLeft,
    daysInCycle: cycle.payCycleDays,
  });

  const pastTx = [
    ...expenses
      .filter((e) => e.status === "actual" && e.spent_on)
      .map((e) => ({
        amount: e.amount,
        rate_to_mad: e.rate_to_mad,
        date: e.spent_on as string,
        sign: -1 as const,
      })),
    ...income
      .filter((i) => i.received_at)
      .map((i) => ({
        amount: i.amount,
        rate_to_mad: i.rate_to_mad,
        date: String(i.received_at).slice(0, 10),
        sign: 1 as const,
      })),
  ];

  const series = buildBalanceSeries({
    todayBalance: safe.startBalance,
    futurePoints: safe.timeline.points,
    pastTx,
    pastDays: 14,
  });

  const latest = (data.latest ?? []).slice(0, 8);

  return (
    <>
      <div className="flex justify-end">
        <Link
          href="/money/expenses"
          className="rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] shadow-sm active:scale-[0.98]"
        >
          Add expense
        </Link>
      </div>

      <WalletHero
        safe={safe}
        cycleStart={cycle.cycleStart}
        cycleEnd={cycle.cycleEnd}
        pace={pace}
      />

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Balance</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            14d history · projected
          </p>
        </div>
        <div className="mt-1">
          <BalanceSparkline series={series} />
        </div>
      </section>

      {latest.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium">Latest</p>
          <ul className="mt-3 space-y-2.5">
            {latest.map((e) => (
              <li
                key={e.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {e.note || "Expense"}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {e.spent_on ?? "—"}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums font-semibold">
                  −{formatMoney(Number(e.amount))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-4 shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium">Can I afford this?</p>
        <p className="mt-0.5 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
          Preview the timeline impact before you buy.
        </p>
        <AffordForm />
      </section>

      {/* overallBalance kept available if you want a tiny footer later */}
      <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))]">
        Book {formatMoney(overallBalance)}
      </p>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-[1.75rem] bg-[hsl(var(--muted))]" />
      <div className="h-44 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<NumbersSkeleton />}>
        <DashboardNumbers />
      </Suspense>
    </div>
  );
}
