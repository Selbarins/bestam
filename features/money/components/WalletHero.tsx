"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { SafeToSpendV2Result } from "@/lib/calc/safe-to-spend-v2";

type Props = {
  safe: SafeToSpendV2Result;
  cycleStart: string;
  cycleEnd: string;
};

export function WalletHero({ safe, cycleStart, cycleEnd }: Props) {
  const [mode, setMode] = useState<"today" | "until">("today");

  const daily = safe.daily;
  const until = safe.discretionary; // total free until payday after buffer

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-sm">
      {/* Wallet pocket look */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-black/10" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide opacity-90">
          Safe to spend
        </p>
        <div className="flex rounded-full bg-black/15 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("today")}
            className={`rounded-full px-2.5 py-1 transition ${
              mode === "today" ? "bg-white/90 text-[hsl(var(--primary))]" : "opacity-80"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMode("until")}
            className={`rounded-full px-2.5 py-1 transition ${
              mode === "until" ? "bg-white/90 text-[hsl(var(--primary))]" : "opacity-80"
            }`}
          >
            Until payday
          </button>
        </div>
      </div>

      <p
        className={`mt-3 text-4xl font-semibold tracking-tight tabular-nums ${
          daily <= 0 ? "text-amber-100" : ""
        }`}
      >
        {mode === "today" ? formatMoney(daily) : formatMoney(Math.max(0, until))}
        <span className="ml-1 text-base font-medium opacity-80">
          {mode === "today" ? "/day" : " total"}
        </span>
      </p>

      <p className="mt-2 text-[11px] opacity-85">
        Lowest {formatMoney(safe.lowestBalance)}
        {safe.lowestDate ? ` on ${safe.lowestDate}` : ""}
        {safe.safetyBuffer > 0
          ? ` · buffer ${formatMoney(safe.safetyBuffer)}`
          : ""}
      </p>
      <p className="text-[11px] opacity-75">
        Cycle {cycleStart} → {cycleEnd} · {safe.daysLeft}d left
      </p>
    </section>
  );
}
