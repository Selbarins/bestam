"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense, createExpenseData } from "../actions";
import { parseExpenseText, matchCategory } from "@/lib/nl/parse-expense";
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
  const [nl, setNl] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(
    () => accounts.find((a) => a.type === "bank")?.id ?? accounts[0]?.id ?? ""
  );
  const [queued, setQueued] = useState(0);
  const [offline, setOffline] = useState(false);

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

  function applyNl(text: string) {
    setNl(text);
    const parsed = parseExpenseText(text);
    if (!parsed) return;
    setAmount(String(parsed.amount));
    if (parsed.note) setNote(parsed.note);
    const matched = matchCategory(parsed.tokens, categories);
    if (matched) setCategoryId(matched);
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    const amt = Number(formData.get("amount"));
    const cat = String(formData.get("category_id") || "") || null;
    const n = String(formData.get("note") || "").trim() || null;
    const acc = String(formData.get("account_id") || "") || null;

    if (!navigator.onLine) {
      enqueueExpense({ amount: amt, category_id: cat, note: n });
      setQueued(getQueue().length);
      setError(null);
      router.push("/");
      return;
    }

    // Ensure account_id is in the FormData the server action reads
    if (acc) formData.set("account_id", acc);

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
      {(offline || queued > 0) && (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          {offline
            ? "Offline — expenses will sync when you’re back online"
            : `${queued} queued expense${queued > 1 ? "s" : ""} syncing…`}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Quick type
        </label>
        <input
          type="text"
          value={nl}
          onChange={(e) => applyNl(e.target.value)}
          placeholder='e.g. "coffee 25" or "45 groceries"'
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary)/0.5)]"
        />
      </div>

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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border-0 bg-transparent text-5xl font-semibold tracking-tight tabular-nums text-[hsl(var(--foreground))] outline-none transition-colors placeholder:text-[hsl(var(--muted-foreground)/0.35)] focus:text-[hsl(var(--primary))]"
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
                className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition-all duration-150 ${
                  accountId === a.id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))] shadow-sm"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.4)]"
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
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-all duration-150 ${
                      categoryId === cat.id
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))] shadow-sm"
                        : "glass hover:border-[hsl(var(--primary)/0.4)]"
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
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm outline-none transition-all duration-150 focus:border-[hsl(var(--primary)/0.5)] focus:shadow-sm"
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
