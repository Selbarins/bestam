"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { deleteRecurring, toggleRecurring } from "../actions";

type Props = {
  id: string;
  kind: "income" | "expense";
  name: string;
  amount: number;
  day_of_month: number;
  active: boolean;
  categoryName?: string | null;
};

export function RecurringRow({
  id,
  kind,
  name,
  amount,
  day_of_month,
  active,
  categoryName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleRecurring(id, !active);
      if (result?.error) alert(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this recurring item?")) return;
    startTransition(async () => {
      const result = await deleteRecurring(id);
      if (result?.error) alert(result.error);
      else router.refresh();
    });
  }

  return (
    <div
      className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3.5 transition-all ${
        isPending ? "opacity-50" : ""
      } ${!active ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {kind === "income" ? "Income" : "Expense"}
            {categoryName ? ` · ${categoryName}` : ""}
            {` · day ${day_of_month}`}
            {!active ? " · paused" : ""}
          </p>
        </div>
        <p
          className={`shrink-0 text-sm font-semibold tabular-nums ${
            kind === "income" ? "text-[hsl(var(--primary))]" : ""
          }`}
        >
          {kind === "income" ? "+" : "−"}
          {formatMoney(amount)}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
        >
          {active ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
