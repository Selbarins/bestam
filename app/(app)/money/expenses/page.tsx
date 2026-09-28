import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import Link from "next/link";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, bucket")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Add expense</h1>
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

      <ExpenseForm categories={categories ?? []} />
    </div>
  );
}
