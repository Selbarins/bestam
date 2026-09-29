"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCartItem } from "../actions";

type Category = {
  id: string;
  name: string;
  bucket: string;
};

export function CartForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addCartItem(formData);
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
        + Add planned item
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
          What
        </label>
        <input
          name="name"
          required
          autoFocus
          placeholder="Headphones, shoes…"
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Estimated price
        </label>
        <div className="relative mt-1.5">
          <input
            name="estimated_amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            placeholder="0"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 pr-12 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
            MAD
          </span>
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Category <span className="font-normal">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm transition-all duration-150 hover:border-[hsl(var(--primary)/0.4)] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
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

      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Note <span className="font-normal">(optional)</span>
        </label>
        <input
          name="note"
          type="text"
          placeholder="Size, color…"
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

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
          className="flex-1 rounded-2xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Add to cart"}
        </button>
      </div>
    </form>
  );
}
