"use client";

import { useState, useTransition } from "react";
import { previewPurchase, type AffordResult } from "../actions-afford";
import { formatMoney } from "@/lib/format";

const statusCopy: Record<
  AffordResult["status"],
  { title: string; tone: string }
> = {
  comfortable: {
    title: "Comfortable",
    tone: "text-[hsl(var(--primary))]",
  },
  tight: {
    title: "Possible, with impact",
    tone: "text-amber-700",
  },
  buffer: {
    title: "Touches your safety buffer",
    tone: "text-amber-800",
  },
  overdrawn: {
    title: "Would go negative before payday",
    tone: "text-red-600",
  },
};

export function AffordForm() {
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<AffordResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await previewPurchase({
        amount: Number(amount),
        label: label || undefined,
      });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res.result);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            What are you buying?
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Headphones, dinner…"
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Amount (MAD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm tabular-nums"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Checking…" : "Can I afford this?"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4 space-y-3">
          <p className={`text-sm font-medium ${statusCopy[result.status].tone}`}>
            {statusCopy[result.status].title}
          </p>
          <p className="text-sm">
            <span className="font-medium">{result.label}</span>
            {" · "}
            {formatMoney(result.amount)}
          </p>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                Safe-to-Spend / day
              </dt>
              <dd className="tabular-nums">
                {formatMoney(result.beforeDaily)} →{" "}
                {formatMoney(result.afterDaily)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                Lowest balance
              </dt>
              <dd className="tabular-nums">
                {formatMoney(result.beforeLowest)} →{" "}
                {formatMoney(result.afterLowest)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">
                After buffer
              </dt>
              <dd className="tabular-nums">
                {formatMoney(result.beforeDiscretionary)} →{" "}
                {formatMoney(result.afterDiscretionary)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Preview only — nothing is saved until you log an expense.
          </p>
        </div>
      )}
    </div>
  );
}
