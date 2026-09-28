export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Safe to spend today
        </p>
        <h1 className="mt-1 text-5xl font-bold tracking-tight text-[hsl(var(--primary))]">
          —
        </h1>
      </header>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Balance
        </p>
        <p className="mt-1 text-2xl font-semibold">— MAD</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition active:scale-[0.98]">
          <p className="text-sm font-medium">Add expense</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Two-tap capture
          </p>
        </button>
        <button className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition active:scale-[0.98]">
          <p className="text-sm font-medium">Mark salary</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Received
          </p>
        </button>
      </section>
    </div>
  );
}
