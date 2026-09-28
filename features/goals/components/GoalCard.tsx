"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { deleteGoal } from "../actions";

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
    </div>
  );
}
