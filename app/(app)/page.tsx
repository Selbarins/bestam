import { Suspense } from "react";
import Link from "next/link";
import { calcBalance } from "@/lib/calc/balance";
import { calcRunway } from "@/lib/calc/runway";
import { calcSpendingPace } from "@/lib/calc/pace";
import { formatMoney } from "@/lib/format";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { WalletHero } from "@/features/money/components/WalletHero";
import { HomeSection } from "@/features/money/components/HomeSection";
import { BalanceSparkline } from "@/features/money/components/BalanceSparkline";
import { QuickSpendChips } from "@/features/money/components/QuickSpendChips";
import { AffordForm } from "@/features/money/components/AffordForm";
import { ExplainTimeline } from "@/features/money/components/ExplainTimeline";
import { ReconcileForm } from "@/features/accounts/components/ReconcileForm";
import { UndoButtons } from "@/features/money/components/UndoButtons";

async function DashboardNumbers() {
  const data = await loadSafeToSpendV2();
  const {
    safe,
    cycle,
    accounts,
    income,
    expenses,
    adjustments,
    conflicts = [],
    latest = [],
    chips = [],
  } = data;

  const bookByAccount: Record<string, number> = {};
  for (const a of accounts) {
    bookByAccount[a.id] = calcBalance(income, expenses, adjustments, {
      accountId: a.id,
      includeUnassigned: a.type === "bank",
    });
  }

  const overallBalance = calcBalance(income, expenses, adjustments);

  // No second network call — expenses already include bucket
  const runway = calcRunway(safe.startBalance, expenses);

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
    dailySafe: safe.daily,
    daysLeft: safe.daysLeft,
    daysInCycle: cycle.payCycleDays,
  });

  const upcoming = safe.timeline.points
    .filter((p) => p.events.length > 0)
    .slice(0, 4);

  const accountPeeks = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: bookByAccount[a.id] ?? 0,
    includeInSafe: a.include_in_safe_to_spend,
  }));

  return (
    <>
      <WalletHero
        safe={safe}
        cycleStart={cycle.cycleStart}
        cycleEnd={cycle.cycleEnd}
        accounts={accountPeeks}
        overallBalance={overallBalance}
      />

      {/* Quick spend */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Quick spend</p>
          <Link
            href="/money/expenses"
            className="text-xs text-[hsl(var(--muted-foreground))]"
          >
            More
          </Link>
        </div>
        <QuickSpendChips chips={chips} />
      </section>

      {/* Pace + runway compact */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Pace</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {pace.status === "ahead" && "Spending faster than the cycle"}
              {pace.status === "under" && "Behind pace — room left"}
              {pace.status === "on_track" && "On pace this cycle"}
            </p>
          </div>
          <p className="text-sm font-semibold tabular-nums">
            {Math.round(pace.usedRatio * 100)}% used
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div
            className={`h-full rounded-full ${
              pace.status === "ahead"
                ? "bg-amber-600"
                : "bg-[hsl(var(--primary))]"
            }`}
            style={{
              width: `${Math.min(100, Math.round(pace.usedRatio * 100))}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>
            Lifestyle{" "}
            <span className="font-medium text-[hsl(var(--foreground))] tabular-nums">
              {runway.lifestyleMonths >= 99
                ? "—"
                : `${runway.lifestyleMonths} mo`}
            </span>
          </span>
          <span>
            Essentials{" "}
            <span className="font-medium text-[hsl(var(--foreground))] tabular-nums">
              {runway.essentialsMonths >= 99
                ? "—"
                : `${runway.essentialsMonths} mo`}
            </span>
          </span>
        </div>
      </section>

      {/* Graph — component already exists */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Until payday</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Projected balance
          </p>
        </div>
        <div className="mt-2">
          <BalanceSparkline
            points={safe.timeline.points}
            lowestDate={safe.lowestDate}
            lowestBalance={safe.lowestBalance}
          />
        </div>
      </section>

      {conflicts.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-medium text-amber-900">Goal notes</p>
          <ul className="mt-1.5 space-y-1">
            {conflicts.map((m) => (
              <li key={m} className="text-xs text-amber-900/90">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <p className="text-sm font-medium">Upcoming</p>
          <ul className="mt-3 space-y-2.5">
            {upcoming.map((p) => (
              <li key={p.date} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {p.date}
                  </span>
                  <span className="tabular-nums font-medium">
                    {formatMoney(p.balance)}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  {p.events.map((e) => e.label).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {latest.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <p className="text-sm font-medium">Latest</p>
          <ul className="mt-3 space-y-2">
            {latest.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate text-[hsl(var(--muted-foreground))]">
                  {e.note || "Expense"}
                  {e.spent_on ? (
                    <span className="ml-1 text-[10px]">{e.spent_on}</span>
                  ) : null}
                </span>
                <span className="tabular-nums font-medium shrink-0">
                  −{formatMoney(Number(e.amount))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <p className="text-sm font-medium">Can I afford this?</p>
        <p className="mt-0.5 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
          Preview only — nothing saved until you log an expense.
        </p>
        <AffordForm />
      </section>

      <HomeSection
        title="How the number is built"
        subtitle="Timeline, lowest day, buffer"
      >
        <ExplainTimeline safe={safe} compact />
      </HomeSection>

      <HomeSection
        title="Reconcile"
        subtitle="Match book to the real world"
      >
        <ReconcileForm accounts={accounts} bookByAccount={bookByAccount} />
      </HomeSection>

      <HomeSection title="Undo" subtitle="Last expense or reconcile">
        <UndoButtons />
      </HomeSection>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
      <div className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
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
