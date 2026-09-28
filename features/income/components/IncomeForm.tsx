"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createIncome } from "../actions";

export function IncomeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createIncome(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-[hsl(var(--muted-foreground))]"
        >
          Amount
        </label>
        <div className="relative mt-2">
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            autoFocus
            placeholder="0"
            className="w-full border-0 bg-transparent text-5xl font-semibold tracking-tight tabular-nums text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground)/0.35)] focus:text-[hsl(var(--primary))]"
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
            MAD
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[hsl(var(--muted-foreground))]"
        >
          Label
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue="Salary"
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm outline-none transition-all duration-150 focus:border-[hsl(var(--primary)/0.5)] focus:shadow-sm"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-4 transition-all duration-150 hover:border-[hsl(var(--primary)/0.35)] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]">
        <input
          type="checkbox"
          name="mark_received"
          defaultChecked
          className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))]"
        />
        <div>
          <p className="text-sm font-medium">Mark as received</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Adds it to your balance immediately
          </p>
        </div>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[hsl(var(--primary))] py-4 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save income"}
      </button>
    </form>
  );
}
