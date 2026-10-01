"use client";

import { useState, useTransition } from "react";
import { reconcileAccount } from "../actions";
import type { Account } from "../types";
import { formatMoney } from "@/lib/format";

type Props = {
  accounts: Account[];
  /** Current book balances keyed by account id (and optional "all") */
  bookByAccount: Record<string, number>;
};

export function ReconcileForm({ accounts, bookByAccount }: Props) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [realBalance, setRealBalance] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const book = bookByAccount[accountId] ?? 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const value = Number(realBalance);
    if (!Number.isFinite(value)) {
      setMessage("Enter a valid number");
      return;
    }

    startTransition(async () => {
      const result = await reconcileAccount({
        accountId,
        realBalance: value,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      if (result.delta === 0) {
        setMessage("Already matched — no change");
      } else {
        setMessage(
          `Adjusted by ${formatMoney(result.delta)}. New book balance: ${formatMoney(value)}`
        );
      }
      setRealBalance("");
    });
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        No accounts yet. Run the accounts migration.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Account
        </label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Book balance
        </p>
        <p className="text-lg font-semibold tabular-nums">{formatMoney(book)}</p>
      </div>

      <div>
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Real balance
        </label>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          value={realBalance}
          onChange={(e) => setRealBalance(e.target.value)}
          placeholder="What does the bank show?"
          className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm tabular-nums"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Reconcile"}
      </button>

      {message && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
      )}
    </form>
  );
}
