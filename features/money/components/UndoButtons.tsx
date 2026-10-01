"use client";

import { useState, useTransition } from "react";
import { undoLastExpense, undoLastAdjustment } from "../undo";
import { formatMoney } from "@/lib/format";

export function UndoButtons() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(
    fn: () => Promise<{ error?: string; success?: boolean; undone?: { amount: number; note: string | null } }>
  ) {
    setMsg(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setMsg(result.error);
        return;
      }
      if (result.undone) {
        setMsg(
          `Removed ${formatMoney(result.undone.amount)}${
            result.undone.note ? ` (${result.undone.note})` : ""
          }`
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(undoLastExpense)}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm active:scale-[0.98] disabled:opacity-60"
        >
          Undo last expense
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(undoLastAdjustment)}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm active:scale-[0.98] disabled:opacity-60"
        >
          Undo last reconcile
        </button>
      </div>
      {msg && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{msg}</p>
      )}
    </div>
  );
}
