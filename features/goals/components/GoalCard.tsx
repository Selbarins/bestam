"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { contributeToGoal, deleteGoal } from "../actions";
import { monthlyNeeded, emergencyMonths, capProgress } from "../projections";

type Props = {
  id: string;
  type: "savings" | "emergency" | "cap";
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  categoryName?: string | null;
  /** For emergency: avg monthly expenses. For cap: spent this month in category */
  contextAmount?: number;
};

export function GoalCard({
  id,
  type,
  name,
  target_amount,
  current_amount,
  target_date,
  categoryName,
  contextAmount = 0,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCap = type === "cap";
  const displayCurrent = isCap ? contextAmount : current_amount;
  const progress = Math.min(
    100,
    target_amount > 0 ? (displayCurrent / target_amount) * 100 : 0
  );

  const proj =
    type === "savings"
      ? monthlyNeeded(target_amount, current_amount, target_date)
      : null;
  const months =
    type === "emergency"
      ? emergencyMonths(current_amount, contextAmount)
      : null;
  const cap =
    type === "cap" ? capProgress(contextAmount, target_amount) : null;

  function handleDelete() {
    if (!confirm("Delete this goal?")) return;
    startTransition(async () => {
      const result = await deleteGoal(id);
      if (result?.error) alert(result.error);
      else router.refresh();
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

  const typeLabel =
    type === "savings"
      ? "Savings"
      : type === "emergency"
        ? "Emergency"
        : "Cap";

  return (
    <div
      className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all ${
        isPending ? "opacity-50" : ""
      } ${cap?.over ? "border-red-300" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            {typeLabel}
            {categoryName ? ` · ${categoryName}` : ""}
          </p>
          <p className="mt-0.5 text-sm font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {isCap ? (
              <>
                {formatMoney(displayCurrent)} of {formatMoney(target_amount)} this
                month
                {cap?.over ? " · over" : ""}
              </>
            ) : (
              <>
                {formatMoney(current_amount)} of {formatMoney(target_amount)}
                {type === "emergency" && months != null && Number.isFinite(months)
                  ? ` · ${months.toFixed(1)} mo runway`
                  : ""}
                {proj && proj.monthly > 0
                  ? ` · ${formatMoney(proj.monthly)}/mo needed`
                  : ""}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-[hsl(var(--muted-foreground))] hover:text-red-600"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            cap?.over ? "bg-red-500" : "bg-[hsl(var(--primary))]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isCap && (
        <div className="mt-4">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full rounded-xl border border-[hsl(var(--border))] py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]"
            >
              + Contribute
            </button>
          ) : (
            <form action={handleContribute} className="flex gap-2">
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Amount"
                className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-[hsl(var(--primary))] px-4 text-xs font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-xl border border-[hsl(var(--border))] px-3 text-xs text-[hsl(var(--muted-foreground))]"
              >
                ×
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
