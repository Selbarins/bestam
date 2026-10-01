import { Suspense } from "react";
import Link from "next/link";
import { calcBalance } from "@/lib/calc/balance";
import { formatMoney } from "@/lib/format";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { UndoButtons } from "@/features/money/components/UndoButtons";
import { calcSpendingPace } from "@/lib/calc/pace";
import { WalletHero } from "@/features/money/components/WalletHero";

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

  const daysInCycle = cycle.payCycleDays;
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
    daysInCycle,
  });

  const paceLine =
    pace.status === "ahead"
      ? `Spending faster than plan · ${Math.round(pace.usedRatio * 100)}% used`
      : pace.status === "under"
        ? `Under pace · ${Math.round(pace.usedRatio * 100)}% used of flexible`
        : `On pace · ${Math.round(pace.usedRatio * 100)}% used`;

  const upcoming = safe.timeline.points
    .filter((p) => p.events.length > 0)
    .slice(0, 3);

  const latest = [...expenses]
    .filter((e) => e.status === "actual")
    .sort((a, b) => String(b.spent_on).localeCompare(String(a.spent_on)))
    .slice(0, 4);

  const accountChips = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    balance: bookByAccount[a.id] ?? 0,
    include_in_safe_to_spend: a.include_in_safe_to_spend,
  }));

  return (
    <div className="space-y-4">
      <WalletHero
        safe={safe}
        cycleStart={cycle.cycleStart}
        cycleEnd={cycle.cycleEnd}
        overallBalance={overallBalance}
        accounts={accountChips}
        paceLine={paceLine}
      />

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2">
          <p className="text-[11px] font-medium text-amber-900">Goal notes</p>
          <ul className="mt-1 space-y-0.5">
            {conflicts.slice(0, 2).map((m) => (
              <li key={m} className="text-xs text-amber-900/90">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming — compact */}
      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Upcoming
            </h2>
            <Link
              href="/money"
              className="text-[11px] text-[hsl(var(--primary))]"
            >
              See all
            </Link>
          </div>
          <ul className="space-y-2">
            {upcoming.map((p) => (
              <li key={p.date} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {p.events.map((e) => e.label).join(" · ")}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {p.date}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-[hsl(var(--muted-foreground))]">
                  {formatMoney(p.balance)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Latest — compact */}
      {latest.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Latest
            </h2>
            <Link
              href="/money/expenses"
              className="text-[11px] text-[hsl(var(--primary))]"
            >
              See all
            </Link>
          </div>
          <ul className="space-y-1.5">
            {latest.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-[hsl(var(--muted-foreground))]">
                  {e.note || "Expense"}
                  {e.spent_on ? (
                    <span className="ml-1 text-[10px] opacity-70">
                      {e.spent_on}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums font-medium">
                  {formatMoney(
                    Number(e.amount) * Number(e.rate_to_mad ?? 1)
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quick actions — one row */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/money/expenses"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-left active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Add expense</p>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Fast capture
          </p>
        </Link>
        <Link
          href="/money/income"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-left active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Mark income</p>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Received
          </p>
        </Link>
      </div>

      {/* Undo — tiny */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2">
        <UndoButtons />
      </div>
    </div>
  );
}

function NumbersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
      <div className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<NumbersSkeleton />}>
      <DashboardNumbers />
    </Suspense>
  );
}
