import { Suspense } from "react";
import Link from "next/link";
import { calcBalance } from "@/lib/calc/balance";
import { formatMoney } from "@/lib/format";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { loadSafeToSpendV2 } from "@/features/money/safe-to-spend-data";
import { ReconcileForm } from "@/features/accounts/components/ReconcileForm";
import { UndoButtons } from "@/features/money/components/UndoButtons";

async function DashboardNumbers() {
  const data = await loadSafeToSpendV2();
  const { safe, cycle, accounts, income, expenses, adjustments } = data;

  const bookByAccount: Record<string, number> = {};
  for (const a of accounts) {
    bookByAccount[a.id] = calcBalance(income, expenses, adjustments, {
      accountId: a.id,
      includeUnassigned: a.type === "bank",
    });
  }

  const overallBalance = calcBalance(income, expenses, adjustments);

  // Upcoming commitments from timeline (next few non-zero event days)
  const upcoming = safe.timeline.points
    .filter((p) => p.events.length > 0)
    .slice(0, 5);

  const freeRatio =
    safe.startBalance > 0
      ? Math.max(
          0,
          Math.min(1, Math.max(0, safe.discretionary) / safe.startBalance)
        )
      : safe.daily > 0
        ? 1
        : 0;

  return (
    <>
      <header className="flex flex-col items-center pt-2">
        <ProgressRing value={freeRatio} size={220} stroke={11}>
          <p className="text-xs font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
            Safe today
          </p>
          <p
            className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${
              safe.daily <= 0
                ? "text-red-600"
                : "text-[hsl(var(--foreground))]"
            }`}
          >
            {formatMoney(safe.daily)}
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            {safe.daysLeft}d left in cycle
          </p>
        </ProgressRing>
        <p className="mt-2 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
          Lowest {formatMoney(safe.lowestBalance)}
          {safe.lowestDate ? ` on ${safe.lowestDate}` : ""}
          {safe.safetyBuffer > 0
            ? ` · buffer ${formatMoney(safe.safetyBuffer)}`
            : ""}
        </p>
        <p className="text-center text-[11px] text-[hsl(var(--muted-foreground))]">
          Cycle {cycle.cycleStart} → {cycle.cycleEnd}
        </p>
      </header>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Book balance
          </p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatMoney(overallBalance)}
          </p>
        </div>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Spendable start for timeline: {formatMoney(safe.startBalance)}
        </p>

        {accounts.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-[hsl(var(--border))] pt-3">
            {accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[hsl(var(--muted-foreground))]">
                  {a.name}
                  {!a.include_in_safe_to_spend && (
                    <span className="ml-1 text-[10px]">(excluded)</span>
                  )}
                </span>
                <span className="tabular-nums font-medium">
                  {formatMoney(bookByAccount[a.id] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4 text-sm">
          <li className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">
              Lowest projected
            </span>
            <span className="tabular-nums font-medium">
              {formatMoney(safe.lowestBalance)}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">
              After buffer
            </span>
            <span className="tabular-nums font-medium">
              {formatMoney(safe.discretionary)}
            </span>
          </li>
          <li className="flex justify-between font-medium">
            <span>Per day</span>
            <span className="tabular-nums">{formatMoney(safe.daily)}</span>
          </li>
        </ul>
      </section>

      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="text-sm font-medium">Upcoming</h2>
          <ul className="mt-3 space-y-2">
            {upcoming.map((p) => (
              <li key={p.date} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {p.date}
                  </span>
                  <span className="tabular-nums font-medium">
                    {formatMoney(p.balance)}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {p.events.map((e) => e.label).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Reconcile</h2>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Type what the bank (or cash) actually shows.
        </p>
        <div className="mt-4">
          <ReconcileForm accounts={accounts} bookByAccount={bookByAccount} />
        </div>
      </section>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Undo</h2>
        <div className="mt-3">
          <UndoButtons />
        </div>
      </section>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <>
      <header className="flex flex-col items-center pt-2">
        <div className="h-[220px] w-[220px] animate-pulse rounded-full bg-[hsl(var(--muted))]" />
      </header>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="h-8 animate-pulse rounded bg-[hsl(var(--muted))]" />
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<NumbersSkeleton />}>
        <DashboardNumbers />
      </Suspense>

      <section className="grid grid-cols-2 gap-4">
        <Link
          href="/money/expenses"
          className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition-all duration-200 hover:border-[hsl(var(--primary)/0.35)] hover:shadow-md active:scale-[0.98]"
        >
          <p className="text-sm font-medium transition-colors group-hover:text-[hsl(var(--primary))]">
            Add expense
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Two-tap capture
          </p>
        </Link>

        <Link
          href="/money/income"
          className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition-all duration-200 hover:border-[hsl(var(--primary)/0.35)] hover:shadow-md active:scale-[0.98]"
        >
          <p className="text-sm font-medium transition-colors group-hover:text-[hsl(var(--primary))]">
            Mark salary
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Received
          </p>
        </Link>
      </section>
    </div>
  );
}
