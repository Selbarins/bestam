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
      // Prefer created_at for time; fall back to received_at
      date: i.created_at || i.received_at || "",
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
      date: e.created_at || e.spent_on || "",
      meta: e.status === "planned" ? "Planned" : undefined,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 15);

  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl px-5 py-10 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No activity yet
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
        <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/40" />
      ))}
    </div>
  );
}

export default function MoneyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Money</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Activity · capture · plans
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/money/expenses"
          className="glass-btn rounded-full px-3.5 py-1.5 text-xs font-medium"
        >
          Add expense
        </Link>
        <Link
          href="/money/income"
          className="glass rounded-full px-3.5 py-1.5 text-xs font-medium"
        >
          Add income
        </Link>
        <Link
          href="/money/cart"
          className="glass rounded-full px-3.5 py-1.5 text-xs font-medium"
        >
          Cart
        </Link>
        <Link
          href="/money/recurring"
          className="glass rounded-full px-3.5 py-1.5 text-xs font-medium"
        >
          Recurring
        </Link>
      </div>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-medium">Recent activity</h2>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </section>
    </div>
  );
}
