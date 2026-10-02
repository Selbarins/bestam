"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { SafeToSpendV2Result } from "@/lib/calc/safe-to-spend-v2";

type AccountPeek = {
  id: string;
  name: string;
  type: string;
  balance: number;
  includeInSafe: boolean;
};

type Props = {
  safe: SafeToSpendV2Result;
  cycleStart: string;
  cycleEnd: string;
  accounts: AccountPeek[];
  overallBalance: number;
};

export function WalletHero({
  safe,
  cycleStart,
  cycleEnd,
  accounts,
  overallBalance,
}: Props) {
  const [mode, setMode] = useState<"today" | "until">("today");
  const [hidden, setHidden] = useState(false);

  const daily = safe.daily;
  const until = Math.max(0, safe.discretionary);
  const isZero = daily <= 0;

  const display = (n: number) => (hidden ? "••••" : formatMoney(n));

  return (
    <div className="space-y-3">
      {/* Peeking account chips */}
      {accounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="min-w-[7.5rem] shrink-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-sm"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {a.name}
                {!a.includeInSafe && " · out"}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {display(a.balance)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sage wallet card */}
      <section className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-md">
        {/* Stitch / pocket line */}
        <div className="pointer-events-none absolute inset-x-4 top-3 h-px bg-white/25" />
        <div className="pointer-events-none absolute inset-y-4 left-3 w-px bg-white/15" />

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide opacity-90">
            Safe to spend
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              className="rounded-full bg-black/15 px-2.5 py-1 text-[11px] opacity-90 active:scale-[0.98]"
              aria-label={hidden ? "Show amounts" : "Hide amounts"}
            >
              {hidden ? "Show" : "Hide"}
            </button>
            <div className="flex rounded-full bg-black/15 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setMode("today")}
                className={`rounded-full px-2.5 py-1 transition ${
                  mode === "today"
                    ? "bg-white/95 text-[hsl(var(--primary))]"
                    : "opacity-80"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMode("until")}
                className={`rounded-full px-2.5 py-1 transition ${
                  mode === "until"
                    ? "bg-white/95 text-[hsl(var(--primary))]"
                    : "opacity-80"
                }`}
              >
                Until payday
              </button>
            </div>
          </div>
        </div>

        {isZero && mode === "today" ? (
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-semibold tracking-tight">
              Nothing free today
            </p>
            <p className="text-sm opacity-90">
              Back on track after the tightest day
              {safe.lowestDate ? ` (${safe.lowestDate})` : ""}.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">
            {mode === "today" ? display(daily) : display(until)}
            <span className="ml-1.5 text-base font-medium opacity-80">
              {mode === "today" ? "/day" : " total"}
            </span>
          </p>
        )}

        <p className="mt-3 text-[11px] opacity-85">
          Book {display(overallBalance)}
          {" · "}
          Spendable {display(safe.startBalance)}
        </p>
        <p className="text-[11px] opacity-80">
          Lowest {display(safe.lowestBalance)}
          {safe.lowestDate ? ` on ${safe.lowestDate}` : ""}
          {safe.safetyBuffer > 0
            ? ` · buffer ${display(safe.safetyBuffer)}`
            : ""}
        </p>
        <p className="text-[11px] opacity-75">
          Cycle {cycleStart} → {cycleEnd} · {safe.daysLeft}d left
        </p>
      </section>
    </div>
  );
}
