import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import { RecurringForm } from "@/features/recurring/components/RecurringForm";
import { RecurringRow } from "@/features/recurring/components/RecurringRow";

async function RecurringContent() {
  const supabase = await createClient();
  const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: items }, { data: categories }, { data: occurrences }] =
    await Promise.all([
      supabase
        .from("recurring_items")
        .select(
          "id, kind, name, amount, day_of_month, active, categories(name)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id, name, bucket")
        .order("sort_order"),
      supabase
        .from("recurring_occurrences")
        .select("recurring_item_id, status")
        .eq("period_month", period),
    ]);

  const statusByItem = new Map(
    (occurrences ?? []).map((o) => [o.recurring_item_id, o.status as "paid" | "skipped"])
  );

  const list = items ?? [];
  const activeExpenses = list
    .filter((i) => i.active && i.kind === "expense")
    .reduce((s, i) => s + Number(i.amount), 0);
  const activeIncome = list
    .filter((i) => i.active && i.kind === "income")
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      {(activeExpenses > 0 || activeIncome > 0) && (
        <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Monthly bills
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatMoney(activeExpenses)}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Monthly income
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[hsl(var(--primary))]">
              {formatMoney(activeIncome)}
            </p>
          </div>
        </div>
      )}

      <RecurringForm categories={categories ?? []} />

      {list.length === 0 ? (
          <div className="glass rounded-2xl px-5 py-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No recurring items
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Rent, salary, subscriptions…
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => (
            <RecurringRow
              key={item.id}
              id={item.id}
              kind={item.kind as "income" | "expense"}
              name={item.name}
              amount={Number(item.amount)}
              day_of_month={item.day_of_month}
              active={item.active}
              categoryName={
                (item.categories as { name?: string } | null)?.name ?? null
              }
              occurrenceStatus={statusByItem.get(item.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--muted))]"
        />
      ))}
    </div>
  );
}

export default function RecurringPage() {
  return (
      return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recurring</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Bills & salary
          </p>
        </div>
        <Link
          href="/money"
          className="glass rounded-full px-3 py-1.5 text-xs font-medium"
        >
          Back
        </Link>
      </div>

      <Suspense fallback={<Skeleton />}>
        <RecurringContent />
      </Suspense>
    </div>
  );
}
