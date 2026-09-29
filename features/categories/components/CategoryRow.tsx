"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory, updateCategory } from "../actions";

const BUCKETS = [
  { value: "essentials", label: "Essentials" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "growth", label: "Growth" },
  { value: "other", label: "Other" },
] as const;

type Props = {
  id: string;
  name: string;
  bucket: string;
};

export function CategoryRow({ id, name, bucket }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete “${name}”? Expenses keep their amounts; category is cleared.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="space-y-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--card))] p-3"
      >
        <input
          name="name"
          defaultValue={name}
          required
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
        <div className="grid grid-cols-2 gap-1.5">
          {BUCKETS.map((b) => (
            <label
              key={b.value}
              className="cursor-pointer rounded-lg border border-[hsl(var(--border))] px-2 py-1.5 text-xs has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--accent))]"
            >
              <input
                type="radio"
                name="bucket"
                value={b.value}
                defaultChecked={b.value === bucket}
                className="sr-only"
              />
              {b.label}
            </label>
          ))}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-[hsl(var(--border))] py-1.5 text-xs text-[hsl(var(--muted-foreground))]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-[hsl(var(--primary))] py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-60"
          >
            {isPending ? "…" : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1.5 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <span className="min-w-0 truncate text-xs font-medium">{name}</span>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))] hover:text-red-600 disabled:opacity-50"
        >
          Del
        </button>
      </div>
    </div>
  );
}
