"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseData } from "../actions";
import {
  enqueueExpense,
  getQueue,
  removeFromQueue,
} from "@/lib/offline/queue";

type Category = {
  id: string;
  name: string;
  bucket: string;
};

type AccountOption = {
  id: string;
  name: string;
  type: string;
};

/** Accept "45.6" or "45,6" */
function parseAmount(raw: string): number {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function ExpenseForm({
  categories,
  accounts = [],
}: {
  categories: Category[];
  accounts?: AccountOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(
    () => accounts.find((a) => a.type === "bank")?.id ?? accounts[0]?.id ?? ""
  );
  const [queued, setQueued] = useState(0);
  const [offline, setOffline] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function resetForm() {
    setAmount("");
    setNote("");
    setCategoryId("");
    setError(null);
    // keep accountId — usually same wallet
  }

  useEffect(() => {
    setQueued(getQueue().length);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);

    async function flush() {
      const q = getQueue();
      if (!q.length || !navigator.onLine) return;
      for (const item of q) {
        const result = await createExpenseData({
          amount: item.amount,
          category_id: item.category_id,
          note: item.note,
        });
        if (!result?.error) removeFromQueue(item.id);
      }
      setQueued(getQueue().length);
      router.refresh();
    }

    function onOnline() {
      setOffline(false);
      flush();
    }
    function onOffline() {
      setOffline(true);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    flush();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedFlash(false);

    const amt = parseAmount(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter a valid amount (use . or ,)");
      return;
    }

    const cat = categoryId || null;
    const n = note.trim() || null;
    const acc = accountId || null;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueExpense({ amount: amt, category_id: cat, note: n });
      setQueued(getQueue().length);
      resetForm();
      setSavedFlash(true);
      return;
    }

    startTransition(async () => {
      const result = await createExpenseData({
        amount: amt,
        category_id: cat,
        note: n,
        account_id: acc,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      setSavedFlash(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(offline || queued > 0) && (
        <p className="glass rounded-xl px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          {offline
            ? "Offline — expenses will sync when you’re back online"
            : `${queued} queued expense${queued > 1 ? "s" : ""} syncing…`}
        </p>
      )}

      {savedFlash && (
        <p className="rounded-xl bg-[hsl(var(--accent))] px-3 py-2 text-xs text-[hsl(var(--accent-foreground))]">
          Saved — add another or go back
        </p>
      )}

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-[hsl(var(--muted-foreground))]"
        >
          Amount
        </label>
        <div className="relative mt-2">
          {/* text + inputMode decimal: iOS shows decimal pad; accepts , or . */}
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            required
            value={amount}
            onChange={(e) => {
              // Allow digits, one separator (. or ,), and optional spaces
              const v = e.target.value;
              if (v === "" || /^[\d\s]*[.,]?[\d\s]*$/.test(v)) {
                setAmount(v);
              }
            }}
            placeholder="0"
            className="w-full border-0 bg-transparent text-5xl font-semibold tracking-tight tabular-nums text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.35)] focus:text-[hsl(var(--primary))]"
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
            MAD
          </span>
        </div>
      </div>

      {accounts.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Account
          </p>
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <label
                key={a.id}
                className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition ${
                  accountId === a.id
                    ? "border border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                    : "glass"
                }`}
              >
                <input
                  type="radio"
                  name="account_id"
                  value={a.id}
                  checked={accountId === a.id}
                  onChange={() => setAccountId(a.id)}
                  className="sr-only"
                />
                <span className="font-medium">{a.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Category
        </p>
        {(
          [
            { key: "essentials", label: "Essentials" },
            { key: "lifestyle", label: "Lifestyle" },
            { key: "growth", label: "Growth" },
            { key: "other", label: "Other" },
          ] as const
        ).map((group) => {
          const items = categories.filter(
            (c) =>
              (c.bucket || "other").toLowerCase() === group.key ||
              (group.key === "other" &&
                !["essentials", "lifestyle", "growth"].includes(
                  (c.bucket || "").toLowerCase()
                ))
          );
          if (items.length === 0) return null;
          return (
            <div key={group.key}>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((cat) => (
                  <label
                    key={cat.id}
                    className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm transition ${
                      categoryId === cat.id
                        ? "border border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                        : "glass"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category_id"
                      value={cat.id}
                      checked={categoryId === cat.id}
                      onChange={() => setCategoryId(cat.id)}
                      className="sr-only"
                    />
                    <span className="font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Coffee, lunch…"
          className="glass mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="glass-btn w-full rounded-2xl py-3.5 text-sm font-medium disabled:opacity-60"
      >
        {isPending ? "Saving…" : offline ? "Save offline" : "Save expense"}
      </button>
    </form>
  );
}
