"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { formatWhen } from "@/lib/format-time";
import { deleteExpense, deleteIncome } from "../actions";
import { EditTransactionSheet } from "./EditTransactionSheet";

type Props = {
  id: string;
  kind: "income" | "expense";
  title: string;
  amount: number;
  /** Raw ISO or date string from DB — never pre-format */
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
        className={`glass flex items-center justify-between rounded-2xl px-4 py-3 transition ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {formatWhen(date)}
            {meta ? ` · ${meta}` : ""}
          </p>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-1.5">
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
            className="rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:bg-white/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:bg-white/40 hover:text-red-600 disabled:opacity-50"
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
