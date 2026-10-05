"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { deleteCartItem, markCartItemBought } from "../actions";

type Props = {
  id: string;
  name: string;
  estimated_amount: number;
  note?: string | null;
  categoryName?: string | null;
};

export function CartItemRow({
  id,
  name,
  estimated_amount,
  note,
  categoryName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleBought() {
    startTransition(async () => {
      const result = await markCartItemBought(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Remove this item from cart?")) return;
    startTransition(async () => {
      const result = await deleteCartItem(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className={`glass rounded-2xl px-4 py-3.5 transition ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {[categoryName, note].filter(Boolean).join(" · ") || "Planned"}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">
          {formatMoney(estimated_amount)}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleBought}
          disabled={isPending}
          className="glass-btn flex-1 rounded-xl py-2 text-xs font-medium disabled:opacity-50"
        >
          Mark bought
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-red-600 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
