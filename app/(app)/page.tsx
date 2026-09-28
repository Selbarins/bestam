import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcBalance } from "@/lib/calc/balance";
import { calcSafeToSpend } from "@/lib/calc/safe-to-spend";
import { formatMoney } from "@/lib/format";

async function DashboardNumbers() {
  const supabase = await createClient();

    const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase.from("income").select("amount, rate_to_mad, received_at"),
    supabase.from("expenses").select("amount, rate_to_mad, status"),
  ]);

  const balance = calcBalance(income ?? [], expenses ?? []);
  const safe = calcSafeToSpend(income ?? [], expenses ?? []);

  return (
    <>
      <header className="pt-4">
        <p className="text-sm font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
          Safe to spend today
        </p>
        <h1 className="mt-2 text-6xl font-semibold tracking-tight tabular-nums text-[hsl(var(--foreground))]">
          {formatMoney(safe.daily)}
        </h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          {safe.daysLeft} days left · {formatMoney(safe.monthly)} this month
        </p>
      </header>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Current balance
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {formatMoney(balance)}
        </p>
      </section>
    </>
  );
}

function NumbersSkeleton() {
  return (
    <>
      <header className="pt-4">
        <p className="text-sm font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
          Safe to spend today
        </p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight text-[hsl(var(--muted-foreground))]">
          —
        </h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          Loading…
        </p>
      </header>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Current balance
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-[hsl(var(--muted-foreground))]">
          —
        </p>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
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
