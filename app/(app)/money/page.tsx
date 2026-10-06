import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActivityRow } from "@/features/money/components/ActivityRow";
import { formatMoney } from "@/lib/format";

function monthKeys(count = 6, now = new Date()) {
  const keys: { key: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    keys.push({ key, label });
  }
  return keys;
}

function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type Row = {
  id: string;
  kind: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  meta?: string;
};

async function MonthHistory({ month }: { month: string }) {
  const supabase = await createClient();
  const start = `${month}-01`;
  // next month start for range end
  const [y, m] = month.split("-").map(Number);
  const next = new Date(y, m, 1); // m is 1-based month number → Date month index = m (next month)
  const end = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase
      .from("income")
      .select("id, name, amount, received_at, created_at")
      .gte("received_at", start)
      .lt("received_at", end)
      .order("received_at", { ascending: false }),
    supabase
      .from("expenses")
      .select(
        "id, amount, note, status, spent_on, created_at, categories(name)"
      )
      .eq("status", "actual")
      .gte("spent_on", start)
      .lt("spent_on", end)
      .order("spent_on", { ascending: false }),
  ]);

  // Fallback: expenses with null spent_on but created_at in month
  const rows: Row[] = [
    ...(income ?? []).map((i) => ({
      id: i.id,
      kind: "income" as const,
      title: i.name,
      amount: Number(i.amount),
      date: i.created_at || i.received_at || "",
      meta: "Income",
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
      meta: undefined,
    })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const spent = rows
    .filter((r) => r.kind === "expense")
    .reduce((s, r) => s + r.amount, 0);
  const earned = rows
    .filter((r) => r.kind === "income")
    .reduce((s, r) => s + r.amount, 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl px-3 py-8 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No activity this month
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        <span>
          In{" "}
          <strong className="text-[hsl(var(--primary))] tabular-nums">
            {formatMoney(earned)}
          </strong>
        </span>
        <span>
          Out{" "}
          <strong className="tabular-nums text-[hsl(var(--foreground))]">
            {formatMoney(spent)}
          </strong>
        </span>
        <span>
          Net{" "}
          <strong
            className={`tabular-nums ${
              earned - spent >= 0
                ? "text-[hsl(var(--primary))]"
                : "text-red-600"
            }`}
          >
            {formatMoney(earned - spent)}
          </strong>
        </span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <ActivityRow key={`${row.kind}-${row.id}`} {...row} />
        ))}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/40" />
      ))}
    </div>
  );
}

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const months = monthKeys(6);
  const month =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : currentMonthKey();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Money</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          History · plans
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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
        <Link
          href="/settings"
          className="glass rounded-full px-3.5 py-1.5 text-xs font-medium"
        >
          Settings
        </Link>
      </div>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-medium">History</h2>

        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {months.map((m) => {
            const active = m.key === month;
            return (
              <Link
                key={m.key}
                href={`/money?month=${m.key}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "glass text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        <Suspense key={month} fallback={<HistorySkeleton />}>
          <MonthHistory month={month} />
        </Suspense>
      </section>
    </div>
  );
}
