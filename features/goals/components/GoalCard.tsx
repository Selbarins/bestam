"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { contributeToGoal, deleteGoal } from "../actions";

type Props = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
};

export function GoalCard({
  id,
  name,
  target_amount,
  current_amount,
  target_date,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.min(100, (current_amount / target_amount) * 100);

  function handleDelete() {
    if (!confirm("Delete this goal?")) return;
    startTransition(async () => {
      const result = await deleteGoal(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleContribute(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await contributeToGoal(id, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setShowAdd(false);
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:shadow-sm ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {formatMoney(current_amount)} of {formatMoney(target_amount)}
            {target_date
              ? ` · by ${new Date(target_date).toLocaleDateString("fr-MA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-red-600"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
        {Math.round(progress)}%
      </p>

      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full rounded-xl border border-[hsl(var(--border))] py-2.5 text-sm font-medium transition-all duration-150 hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))]"
        >
          Add to goal
        </button>
      ) : (
        <form action={handleContribute} className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              autoFocus
              placeholder="Amount"
              className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-all hover:brightness-110 disabled:opacity-60"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl border border-[hsl(var(--border))] px-3 text-sm text-[hsl(var(--muted-foreground))]"
            >
              ✕
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
