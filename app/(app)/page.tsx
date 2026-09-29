import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcBalance } from "@/lib/calc/balance";
import { calcSafeToSpend } from "@/lib/calc/safe-to-spend";
import { formatMoney } from "@/lib/format";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { getGoalReservesMad } from "@/features/goals/actions";

async function DashboardNumbers() {
  const supabase = await createClient();

  const [
    { data: income },
    { data: expenses },
    { data: cart },
    { data: recurring },
    goalReserves,
  ] = await Promise.all([
    supabase.from("income").select("amount, rate_to_mad, received_at"),
    supabase.from("expenses").select("amount, rate_to_mad, status"),
    supabase.from("cart_items").select("estimated_amount, rate_to_mad"),
    supabase
      .from("recurring_items")
      .select("amount, rate_to_mad, kind, active")
      .eq("active", true)
      .eq("kind", "expense"),
    getGoalReservesMad(),
  ]);

  const cartTotal = (cart ?? []).reduce(
    (s, i) => s + Number(i.estimated_amount) * Number(i.rate_to_mad ?? 1),
    0
  );

  const recurringExpense = (recurring ?? []).reduce(
    (s, i) => s + Number(i.amount) * Number(i.rate_to_mad ?? 1),
    0
  );

  const balance = calcBalance(income ?? [], expenses ?? []);
  const safe = calcSafeToSpend(
    income ?? [],
    expenses ?? [],
    cartTotal,
    recurringExpense,
    goalReserves
  );

  const breakdown = [
    { label: "Received", amount: safe.received, tone: "plus" as const },
    { label: "Spent", amount: safe.actual, tone: "minus" as const },
    ...(safe.planned > 0
      ? [{ label: "Planned", amount: safe.planned, tone: "minus" as const }]
      : []),
    ...(safe.cart > 0
      ? [{ label: "Cart", amount: safe.cart, tone: "minus" as const }]
      : []),
    ...(safe.recurring > 0
      ? [{ label: "Bills", amount: safe.recurring, tone: "minus" as const }]
      : []),
    ...(safe.goalReserves > 0
      ? [
          {
            label: "Goal set-aside",
            amount: safe.goalReserves,
            tone: "minus" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <header className="flex flex-col items-center pt-2">
        <ProgressRing value={safe.freeRatio} size={220} stroke={11}>
          <p className="text-xs font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
            Safe today
          </p>
          <p
            className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${
              safe.daily < 0 ? "text-red-600" : "text-[hsl(var(--foreground))]"
            }`}
          >
            {formatMoney(safe.daily)}
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            {safe.daysLeft}d left · {formatMoney(safe.monthly)}/mo
          </p>
        </ProgressRing>
      </header>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Current balance
          </p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatMoney(balance)}
          </p>
        </div>

        {breakdown.length > 1 && (
          <ul className="mt-4 space-y-2 border-t border-[hsl(var(--border))] pt-4">
            {breakdown.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[hsl(var(--muted-foreground))]">
                  {row.label}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    row.tone === "plus"
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--foreground))]"
                  }`}
                >
                  {row.tone === "plus" ? "+" : "−"}
                  {formatMoney(row.amount)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2 text-sm font-medium">
              <span>Available this month</span>
              <span
                className={`tabular-nums ${
                  safe.monthly < 0 ? "text-red-600" : ""
                }`}
              >
                {formatMoney(safe.monthly)}
              </span>
            </li>
          </ul>
        )}
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
