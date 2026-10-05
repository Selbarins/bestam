"use client";

import { useTransition } from "react";
import { formatMoney } from "@/lib/format";
import {
  toggleRecurring,
  deleteRecurring,
  markRecurringPaid,
  markRecurringSkipped,
} from "../actions";

type Props = {
  id: string;
  kind: "income" | "expense";
  name: string;
  amount: number;
  day_of_month: number;
  active: boolean;
  categoryName: string | null;
  occurrenceStatus?: "paid" | "skipped" | null;
};

export function RecurringRow({
  id,
  kind,
  name,
  amount,
  day_of_month,
  active,
  categoryName,
  occurrenceStatus = null,
}: Props) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      await fn();
    });
  }

  return (
    <div
      className={`glass rounded-2xl p-4 ${!active ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {kind === "income" ? "Income" : "Bill"} · day {day_of_month}
            {categoryName ? ` · ${categoryName}` : ""}
            {occurrenceStatus === "paid" && " · paid this month"}
            {occurrenceStatus === "skipped" && " · skipped this month"}
          </p>
        </div>
        <p
          className={`text-sm font-semibold tabular-nums ${
            kind === "income" ? "text-[hsl(var(--primary))]" : ""
          }`}
        >
          {kind === "income" ? "+" : "−"}
          {formatMoney(amount)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {active && !occurrenceStatus && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => markRecurringPaid(id))}
              className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs active:scale-[0.98] disabled:opacity-60"
            >
              Mark paid
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => markRecurringSkipped(id))}
              className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs active:scale-[0.98] disabled:opacity-60"
            >
              Skip
            </button>
          </>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleRecurring(id, !active))}
          className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs active:scale-[0.98] disabled:opacity-60"
        >
          {active ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => deleteRecurring(id))}
          className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs text-red-600 active:scale-[0.98] disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
