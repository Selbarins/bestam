import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "@/features/goals/components/GoalForm";
import { GoalCard } from "@/features/goals/components/GoalCard";

async function GoalsList() {
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("id, name, target_amount, current_amount, target_date")
    .eq("type", "savings")
    .order("created_at", { ascending: false });

  if (!goals?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-10 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No goals yet
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Create a savings target to track progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((g) => (
        <GoalCard
          key={g.id}
          id={g.id}
          name={g.name}
          target_amount={Number(g.target_amount)}
          current_amount={Number(g.current_amount)}
          target_date={g.target_date}
        />
      ))}
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

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Goals</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Savings targets
        </p>
      </div>

      <GoalForm />

      <Suspense fallback={<ListSkeleton />}>
        <GoalsList />
      </Suspense>
    </div>
  );
}
