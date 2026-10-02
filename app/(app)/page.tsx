import { Suspense } from "react";
import Link from "next/link";
import { calcSpendingPace } from "@/lib/calc/pace";
import { formatMoney } from "@/lib/format";
import { formatWhen } from "@/lib/format-time";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { WalletHero } from "@/features/money/components/WalletHero";
import { BalanceSparkline } from "@/features/money/components/BalanceSparkline";
import { AffordForm } from "@/features/money/components/AffordForm";

async function DashboardNumbers() {
  const data = await loadSafeToSpendV2();
  const { safe, cycle, expenses } = data;

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
      <div className="flex justify-end">
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

      <section className="glass rounded-2xl p-4">
        <p className="text-sm font-medium">Balance</p>
        <div className="mt-2">
          <BalanceSparkline
            points={safe.timeline.points}
            lowestDate={safe.lowestDate}
            lowestBalance={safe.lowestBalance}
          />
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
