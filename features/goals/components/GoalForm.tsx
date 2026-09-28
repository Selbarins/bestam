"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "../actions";

export function GoalForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGoal(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-[hsl(var(--border))] py-4 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))]"
      >
        + New savings goal
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Name
        </label>
        <input
          name="name"
          required
          placeholder="Emergency buffer, Trip…"
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Target
          </label>
          <input
            name="target_amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0"
            className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Already saved
          </label>
          <input
            name="current_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Target date <span className="font-normal">(optional)</span>
        </label>
        <input
          name="target_date"
          type="date"
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] py-3 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-all hover:brightness-110 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save goal"}
        </button>
      </div>
    </form>
  );
}
