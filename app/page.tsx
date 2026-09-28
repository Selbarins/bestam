import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Fetch totals
  const { data: incomes } = await supabase
    .from("incomes")
    .select("amount")
    .not("received_at", "is", null);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount");

  const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const balance = totalIncome - totalExpenses;

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--primary))]">
            Bestam
          </h1>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Dashboard
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Balance card */}
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Current Balance
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            ${balance.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Income: ${totalIncome.toFixed(2)} · Expenses: ${totalExpenses.toFixed(2)}
          </p>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-4">
          <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-5 text-left hover:border-[hsl(var(--primary))] transition">
            <p className="font-medium">Add Expense</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Record a new expense
            </p>
          </button>

          <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-5 text-left hover:border-[hsl(var(--primary))] transition">
            <p className="font-medium">Mark Salary</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Salary received
            </p>
          </button>
        </section>

        {/* Goals placeholder */}
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="font-medium">Goals</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            No goals yet
          </p>
        </section>

        {/* Recent Activity placeholder */}
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="font-medium">Recent Activity</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            No transactions yet
          </p>
        </section>
      </div>
    </main>
  );
}