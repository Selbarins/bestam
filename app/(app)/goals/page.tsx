import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "@/features/goals/components/GoalForm";
import { GoalCard } from "@/features/goals/components/GoalCard";

async function GoalsList() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [{ data: goals }, { data: categories }, { data: expenses }] =
    await Promise.all([
      supabase
        .from("goals")
        .select(
          "id, type, name, target_amount, current_amount, target_date, category_id, categories(name)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase
        .from("expenses")
        .select("amount, rate_to_mad, status, category_id, spent_on")
        .eq("status", "actual")
        .gte("spent_on", monthStart),
    ]);

  const monthlyExpenses = (expenses ?? []).reduce(
    (s, e) => s + Number(e.amount) * Number(e.rate_to_mad ?? 1),
    0
  );

  const spentByCategory: Record<string, number> = {};
  for (const e of expenses ?? []) {
    if (!e.category_id) continue;
    spentByCategory[e.category_id] =
      (spentByCategory[e.category_id] || 0) +
      Number(e.amount) * Number(e.rate_to_mad ?? 1);
  }

  if (!goals?.length) {
    return (
        <div className="glass rounded-2xl px-5 py-10 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No goals yet
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Savings, emergency fund, or a spending cap
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((g) => {
        const type = g.type as "savings" | "emergency" | "cap";
        let contextAmount = 0;
        if (type === "emergency") contextAmount = monthlyExpenses;
        if (type === "cap" && g.category_id) {
          contextAmount = spentByCategory[g.category_id] || 0;
        }
        return (
          <GoalCard
            key={g.id}
            id={g.id}
            type={type}
            name={g.name}
            target_amount={Number(g.target_amount)}
            current_amount={Number(g.current_amount)}
            target_date={g.target_date}
            categoryName={
              (g.categories as { name?: string } | null)?.name ?? null
            }
            contextAmount={contextAmount}
          />
        );
      })}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl bg-[hsl(var(--muted))]"
        />
      ))}
    </div>
  );
}

async function FormSection() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");
  return <GoalForm categories={categories ?? []} />;
}

export default function GoalsPage() {
  return (
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Savings · Emergency · Caps
        </p>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <FormSection />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <GoalsList />
      </Suspense>
    </div>
  );
}
