"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { deleteExpense, deleteIncome } from "../actions";
import { EditTransactionSheet } from "./EditTransactionSheet";

type Props = {
  id: string;
  kind: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  meta?: string;
};

export function ActivityRow({ id, kind, title, amount, date, meta }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  function handleDelete() {
    if (!confirm("Delete this transaction?")) return;
    startTransition(async () => {
      const result =
        kind === "income" ? await deleteIncome(id) : await deleteExpense(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div
        className={`flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3.5 transition-all duration-200 hover:shadow-sm ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {new Date(date).toLocaleDateString("fr-MA", {
              day: "numeric",
              month: "short",
            })}
            {meta ? ` · ${meta}` : ""}
          </p>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2">
          <p
            className={`text-sm font-semibold tabular-nums ${
              kind === "income"
                ? "text-[hsl(var(--primary))]"
                : "text-[hsl(var(--foreground))]"
            }`}
          >
            {kind === "income" ? "+" : "−"}
            {formatMoney(amount)}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <EditTransactionSheet
          id={id}
          kind={kind}
          amount={amount}
          title={title}
          meta={meta}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
