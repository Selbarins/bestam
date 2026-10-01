import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { getAccounts } from "@/features/accounts/queries";

async function ExpensesContent() {
  const supabase = await createClient();

  const [{ data: categories }, accounts] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, bucket")
      .order("sort_order"),
    getAccounts(),
  ]);

  return (
    <ExpenseForm
      categories={categories ?? []}
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
      }))}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-16 rounded-xl bg-[hsl(var(--muted))]" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-[hsl(var(--muted))]" />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-[hsl(var(--muted))]" />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Add expense</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Amount → category → done
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Cancel
        </Link>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <ExpensesContent />
      </Suspense>
    </div>
  );
}
