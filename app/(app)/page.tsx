import { Suspense } from "react";
import Link from "next/link";
import { calcBalance } from "@/lib/calc/balance";
import { calcRunway } from "@/lib/calc/runway";
import { calcSpendingPace } from "@/lib/calc/pace";
import { formatMoney } from "@/lib/format";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { getExpensesWithBucket } from "@/features/money/expenses-with-bucket";
import { WalletHero } from "@/features/money/components/WalletHero";
import { HomeSection } from "@/features/money/components/HomeSection";
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
  } = data;

  const bookByAccount: Record<string, number> = {};
  for (const a of accounts) {
    bookByAccount[a.id] = calcBalance(income, expenses, adjustments, {
      accountId: a.id,
      includeUnassigned: a.type === "bank",
    });
  }

  const overallBalance = calcBalance(income, expenses, adjustments);
  const expensesForRunway = await getExpensesWithBucket();
  const runway = calcRunway(safe.startBalance, expensesForRunway);

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

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/money/expenses"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm active:scale-[0.98] transition"
        >
          <p className="text-sm font-medium">Add expense</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Two-tap capture
          </p>
        </Link>
        <Link
          href="/money/income"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm active:scale-[0.98] transition"
        >
          <p className="text-sm font-medium">Mark salary</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Received
          </p>
        </Link>
      </section>

      {/* Pace + runway — compact */}
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
            {Math.round(pace.usedRatio * 100)}%
            <span className="font-normal text-[hsl(var(--muted-foreground))]">
              {" "}
              used
            </span>
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
            Runway lifestyle{" "}
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Upcoming</p>
            <Link
              href="/money"
              className="text-xs text-[hsl(var(--muted-foreground))]"
            >
              Money
            </Link>
          </div>
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

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <p className="text-sm font-medium">Can I afford this?</p>
        <p className="mt-0.5 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
          Preview impact before you buy — nothing is saved.
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
        subtitle="Match book balance to the real world"
      >
        <ReconcileForm accounts={accounts} bookByAccount={bookByAccount} />
      </HomeSection>

      <HomeSection title="Undo" subtitle="Last expense or last reconcile">
        <UndoButtons />
      </HomeSection>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="h-14 w-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
        <div className="h-14 w-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
      <div className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
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
