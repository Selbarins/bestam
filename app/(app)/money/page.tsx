import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActivityRow } from "@/features/money/components/ActivityRow";

async function RecentActivity() {
  const supabase = await createClient();

  const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase
      .from("income")
      .select("id, name, amount, received_at, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("expenses")
      .select("id, amount, note, status, spent_on, created_at, categories(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  type Row = {
    id: string;
    kind: "income" | "expense";
    title: string;
    amount: number;
    date: string;
    meta?: string;
  };

  const rows: Row[] = [
    ...(income ?? []).map((i) => ({
      id: i.id,
      kind: "income" as const,
      title: i.name,
      amount: Number(i.amount),
      date: i.received_at ?? i.created_at,
      meta: i.received_at ? "Received" : "Pending",
    })),
    ...(expenses ?? []).map((e) => ({
      id: e.id,
      kind: "expense" as const,
      title:
        e.note ||
        (e.categories as { name?: string } | null)?.name ||
        "Expense",
      amount: Number(e.amount),
      date: e.spent_on || e.created_at,
      meta: e.status === "planned" ? "Planned" : undefined,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 15);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-10 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No activity yet
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Add income or an expense to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <ActivityRow key={`${row.kind}-${row.id}`} {...row} />
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl bg-[hsl(var(--muted))]"
        />
      ))}
    </div>
  );
}

export default function MoneyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Money</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Income · Expenses · Activity
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/money/income"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-all duration-200 hover:border-[hsl(var(--primary)/0.35)] hover:shadow-sm active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Add income</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Salary or other
          </p>
        </Link>
        <Link
          href="/money/expenses"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-all duration-200 hover:border-[hsl(var(--primary)/0.35)] hover:shadow-sm active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Add expense</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Fast capture
          </p>
        </Link>
        <Link
          href="/money/cart"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-all duration-200 hover:border-[hsl(var(--primary)/0.35)] hover:shadow-sm active:scale-[0.98] col-span-2 sm:col-span-1"
        >
          <p className="text-sm font-medium">Shopping cart</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Planned buys
          </p>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Recent activity
        </h2>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </section>
    </div>
  );
}
