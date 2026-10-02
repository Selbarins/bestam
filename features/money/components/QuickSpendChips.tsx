"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseData } from "@/features/expenses/actions";
import { formatMoney } from "@/lib/format";
import type { QuickChip } from "@/features/money/safe-to-spend-data";

type Props = {
  chips: QuickChip[];
};

export function QuickSpendChips({ chips }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (chips.length === 0) {
    return (
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Log a few expenses with notes — quick taps appear here.
      </p>
    );
  }

  function spend(chip: QuickChip) {
    setMsg(null);
    startTransition(async () => {
      const result = await createExpenseData({
        amount: chip.amount,
        note: chip.note,
        category_id: chip.category_id,
      });
      if (result?.error) {
        setMsg(result.error);
        return;
      }
      setMsg(`Logged ${chip.note} · ${formatMoney(chip.amount)}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={`${c.note}-${c.amount}`}
            type="button"
            disabled={pending}
            onClick={() => spend(c)}
            className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2 text-sm shadow-sm transition active:scale-[0.97] disabled:opacity-60 hover:border-[hsl(var(--primary)/0.4)]"
          >
            <span className="font-medium">{c.note}</span>
            <span className="ml-1.5 tabular-nums text-[hsl(var(--muted-foreground))]">
              {formatMoney(c.amount)}
            </span>
          </button>
        ))}
      </div>
      {msg && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{msg}</p>
      )}
    </div>
  );
}
