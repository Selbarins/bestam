import { Suspense } from "react";
import Link from "next/link";
import { calcSpendingPace } from "@/lib/calc/pace";
import { formatMoney } from "@/lib/format";
import { formatWhen } from "@/lib/format-time";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { WalletHero } from "@/features/money/components/WalletHero";
import { HomeCoach } from "@/features/money/components/HomeCoach";
import { BalanceSparkline } from "@/features/money/components/BalanceSparkline";
import { AffordForm } from "@/features/money/components/AffordForm";
import { buildBalanceSeries } from "@/lib/calc/balance-history";

async function DashboardNumbers() {
  const data = await loadSafeToSpendV2();
  const { safe, cycle, expenses, income } = data;

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

    const incomeInCycle = (income ?? [])
    .filter(
      (i) =>
        i.received_at &&
        String(i.received_at).slice(0, 10) >= cycle.cycleStart &&
        String(i.received_at).slice(0, 10) <= cycle.cycleEnd
    )
    .reduce(
      (s, i) => s + Number(i.amount) * Number(i.rate_to_mad ?? 1),
      0
    );


  const pace = calcSpendingPace({
    spentInCycle,
    incomeInCycle,
    daysLeft: safe.daysLeft,
    daysInCycle: cycle.payCycleDays,
  });

  const coachLine =
    pace.incomeInCycle <= 0
      ? "Mark this cycle’s salary so pace can track income used."
      : pace.status === "ahead"
        ? `You’ve used ${Math.round(pace.usedRatio * 100)}% of cycle income with ${pace.daysLeft}d left.`
        : pace.status === "under"
          ? `Only ${Math.round(pace.usedRatio * 100)}% of cycle income spent — ${pace.daysLeft}d left.`
          : `${Math.round(pace.usedRatio * 100)}% of income · ${Math.round(pace.timeElapsedRatio * 100)}% of time — on pace.`;

  

    const pastTx = [
    ...expenses
      .filter((e) => e.status === "actual" && e.spent_on)
      .map((e) => ({
        amount: e.amount,
        rate_to_mad: e.rate_to_mad,
        date: e.spent_on as string,
        sign: -1 as const,
      })),
    ...(data.income ?? [])
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

  const latest = [...expenses]
    .filter((e) => e.status === "actual")
    .sort((a, b) => {
      const ta = String(a.created_at ?? a.spent_on ?? "");
      const tb = String(b.created_at ?? b.spent_on ?? "");
      return tb.localeCompare(ta);
    })
    .slice(0, 8);

  return (
    <>
        <div className="flex items-center justify-between gap-2">
        <Link
          href="/settings"
          className="glass rounded-full px-3 py-1.5 text-xs font-medium"
        >
          Settings
        </Link>
        <Link
          href="/money/expenses"
          className="glass-btn rounded-full px-4 py-2 text-sm font-medium"
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

      <HomeCoach line={coachLine} />

      <section className="glass rounded-2xl p-4">
        <p className="text-sm font-medium">Balance</p>
        <div className="mt-2">
        <BalanceSparkline series={series} />
        </div>
      </section>

      {latest.length > 0 && (
        <section className="glass rounded-2xl p-4">
          <p className="text-sm font-medium">Latest</p>
          <ul className="mt-3 space-y-2.5">
            {latest.map((e) => (
              <li
                key={e.id ?? `${e.note}-${e.spent_on}-${e.amount}`}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.note || "Expense"}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {formatWhen(e.created_at ?? e.spent_on)}
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

      <section className="glass rounded-2xl p-4">
        <p className="text-sm font-medium">Can I afford this?</p>
        <div className="mt-3">
          <AffordForm />
        </div>
      </section>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-[1.75rem] bg-white/40" />
      <div className="h-44 animate-pulse rounded-2xl bg-white/40" />
      <div className="h-32 animate-pulse rounded-2xl bg-white/40" />
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
