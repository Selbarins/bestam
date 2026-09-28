"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "../actions";

type Category = {
  id: string;
  name: string;
  bucket: string;
};

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createExpense(formData);
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
      {/* Amount – big and focused */}
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
            className="w-full border-0 bg-transparent font-serif text-5xl tracking-tight text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.4)]"
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
            MAD
          </span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Category
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-3 text-sm transition has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
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

      {/* Optional note */}
      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-[hsl(var(--muted-foreground))]"
        >
          Note <span className="font-normal">(optional)</span>
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="Coffee, lunch…"
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[hsl(var(--primary))] py-4 text-sm font-medium text-[hsl(var(--primary-foreground))] transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save expense"}
      </button>
    </form>
  );
}
