"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "../actions";

const BUCKETS = [
  { value: "essentials", label: "Essentials" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "growth", label: "Growth" },
  { value: "other", label: "Other" },
] as const;

export function CategoryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(formData);
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
        className="w-full rounded-2xl border border-dashed border-[hsl(var(--border))] py-3.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))]"
      >
        + Add category
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
          autoFocus
          placeholder="Coffee, Pets…"
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Bucket
        </p>
        <div className="grid grid-cols-2 gap-2">
          {BUCKETS.map((b) => (
            <label
              key={b.value}
              className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm transition-all has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
            >
              <input
                type="radio"
                name="bucket"
                value={b.value}
                defaultChecked={b.value === "other"}
                className="sr-only"
              />
              <span className="font-medium">{b.label}</span>
            </label>
          ))}
        </div>
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
          className="flex-1 rounded-2xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
