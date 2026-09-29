"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRecurring } from "../actions";

type Category = {
  id: string;
  name: string;
  bucket: string;
};

export function RecurringForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"expense" | "income">("expense");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createRecurring(formData);
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
        + Add recurring
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <input type="hidden" name="kind" value={kind} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setKind("expense")}
          className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
            kind === "expense"
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
              : "border-[hsl(var(--border))]"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setKind("income")}
          className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
            kind === "income"
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
              : "border-[hsl(var(--border))]"
          }`}
        >
          Income
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Name
        </label>
        <input
          name="name"
          required
          autoFocus
          placeholder={kind === "income" ? "Salary" : "Rent, Netflix…"}
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Amount / month
          </label>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            placeholder="0"
            className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Day of month
          </label>
          <input
            name="day_of_month"
            type="number"
            min="1"
            max="28"
            defaultValue="1"
            className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
          />
        </div>
      </div>

      {kind === "expense" && categories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Category <span className="font-normal">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm transition-all has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
              >
                <input
                  type="radio"
                  name="category_id"
                  value={cat.id}
                  className="sr-only"
                />
                <span className="font-medium">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-2xl border border-[hsl(var(--border))] py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-2xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
