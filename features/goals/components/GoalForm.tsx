"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "../actions";

type Category = { id: string; name: string };

const TYPES = [
  { value: "savings", label: "Savings" },
  { value: "emergency", label: "Emergency" },
  { value: "cap", label: "Spending cap" },
] as const;

export function GoalForm({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"savings" | "emergency" | "cap">("savings");

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
        + New goal
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-xl border py-2 text-xs font-medium transition-all ${
              type === t.value
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                : "border-[hsl(var(--border))]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Name
        </label>
        <input
          name="name"
          required
          placeholder={
            type === "cap"
              ? "Dining limit"
              : type === "emergency"
                ? "Emergency fund"
                : "Trip, laptop…"
          }
          className="mt-1.5 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {type === "cap" ? "Monthly limit" : "Target"}
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
        {type !== "cap" ? (
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
        ) : (
          <div />
        )}
      </div>

      {type === "savings" && (
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
      )}

      {type === "cap" && categories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
              >
                <input
                  type="radio"
                  name="category_id"
                  value={cat.id}
                  className="sr-only"
                  required
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
          className="flex-1 rounded-2xl border border-[hsl(var(--border))] py-3 text-sm text-[hsl(var(--muted-foreground))]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-2xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save goal"}
        </button>
      </div>
    </form>
  );
}
