import { createClient } from "@/lib/supabase/server";
import { calcBalance } from "@/lib/calc/balance";
import { formatMoney } from "@/lib/format";

// This page needs the user session + database → never prerender it
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase.from("income").select("amount, rate_to_mad, received_at"),
    supabase.from("expenses").select("amount, rate_to_mad, status"),
  ]);

  const balance = calcBalance(income ?? [], expenses ?? []);

  return (
    <div className="space-y-10">
      {/* Hero number */}
      <header className="pt-4">
        <p className="text-sm font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
          Safe to spend today
        </p>
        <h1 className="mt-2 font-serif text-6xl tracking-tight text-[hsl(var(--foreground))]">
          —
        </h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          After bills, goals & planned spending
        </p>
      </header>

      {/* Balance card */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Current balance
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatMoney(balance)}
        </p>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-4">
        <a
          href="/money/expenses"
          className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Add expense</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Two-tap capture
          </p>
        </a>

        <a
          href="/money/income"
          className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Mark salary</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Received
          </p>
        </a>
      </section>
    </div>
  );
}
