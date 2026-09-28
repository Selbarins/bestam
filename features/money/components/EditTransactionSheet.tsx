"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateExpense, updateIncome } from "../actions";

type Props = {
  id: string;
  kind: "income" | "expense";
  amount: number;
  title: string;
  meta?: string;
  onClose: () => void;
};

export function EditTransactionSheet({
  id,
  kind,
  amount,
  title,
  meta,
  onClose,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        kind === "income"
          ? await updateIncome(id, formData)
          : await updateExpense(id, formData);

      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit {kind}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[hsl(var(--muted-foreground))]"
          >
            Cancel
          </button>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))]">
              Amount
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={amount}
              className="mt-2 w-full border-0 bg-transparent text-4xl font-semibold tabular-nums outline-none"
            />
          </div>

          {kind === "income" ? (
            <>
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))]">
                  Label
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={title}
                  className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none"
                />
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="mark_received"
                  defaultChecked={meta === "Received"}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Mark as received</span>
              </label>
            </>
          ) : (
            <div>
              <label className="block text-sm text-[hsl(var(--muted-foreground))]">
                Note
              </label>
              <input
                name="note"
                type="text"
                defaultValue={title}
                className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-[hsl(var(--primary))] py-4 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
