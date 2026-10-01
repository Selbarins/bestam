"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { SafeToSpendV2Result } from "@/lib/calc/safe-to-spend-v2";

type AccountChip = {
  id: string;
  name: string;
  balance: number;
  include_in_safe_to_spend: boolean;
};

type Props = {
  safe: SafeToSpendV2Result;
  cycleStart: string;
  cycleEnd: string;
  overallBalance: number;
  accounts: AccountChip[];
  paceLine?: string;
};

export function WalletHero({
  safe,
  cycleStart,
  cycleEnd,
  overallBalance,
  accounts,
  paceLine,
}: Props) {
  const [mode, setMode] = useState<"today" | "until">("today");
  const [hide, setHide] = useState(false);

  const daily = safe.daily;
  const until = Math.max(0, safe.discretionary);
  const hero = mode === "today" ? daily : until;
  const zero = daily <= 0;

  const mask = (n: number) => (hide ? "••••" : formatMoney(n));

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
      {/* stitched top edge */}
      <div className="absolute inset-x-3 top-2 h-px border-t border-dashed border-white/25" />

      <div className="p-4 pb-3 pt-5">
        {/* peeking accounts */}
        {accounts.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
              >
                <p className="text-[10px] opacity-80">
                  {a.name}
                  {!a.include_in_safe_to_spend ? " · excl." : ""}
                </p>
                <p className="text-sm font-medium tabular-nums">
                  {mask(a.balance)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* header + toggle */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium tracking-wide opacity-90">
            Safe to spend
          </p>
          <div className="flex rounded-full bg-black/20 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("today")}
              className={`rounded-full px-2.5 py-1 transition ${
                mode === "today"
                  ? "bg-white text-[hsl(var(--primary))]"
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
                  ? "bg-white text-[hsl(var(--primary))]"
                  : "opacity-80"
              }`}
            >
              Until payday
            </button>
          </div>
        </div>

        {/* hero number */}
        <p
          className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums ${
            zero ? "text-amber-100" : ""
          }`}
        >
          {mask(hero)}
          <span className="ml-1 text-base font-medium opacity-80">
            {mode === "today" ? "/day" : " total"}
          </span>
        </p>

        <p className="mt-1 text-[11px] opacity-85">
          Balance {mask(overallBalance)}
          {safe.safetyBuffer > 0
            ? ` · buffer ${hide ? "••••" : formatMoney(safe.safetyBuffer)}`
            : ""}
        </p>
        <p className="text-[11px] opacity-70">
          {safe.daysLeft}d left · {cycleStart} → {cycleEnd}
        </p>

        {zero && (
          <p className="mt-2 rounded-lg bg-black/15 px-2.5 py-1.5 text-[11px]">
            Nothing free today
            {safe.lowestDate ? ` · recovers around ${safe.lowestDate}` : ""}
          </p>
        )}

        {paceLine && !zero && (
          <p className="mt-2 text-[11px] opacity-90">{paceLine}</p>
        )}

        {/* action pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/money"
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm active:scale-[0.98]"
          >
            Can I afford…?
          </Link>
          <Link
            href="/settings"
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm active:scale-[0.98]"
          >
            Reconcile
          </Link>
          <button
            type="button"
            onClick={() => setHide((h) => !h)}
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm active:scale-[0.98]"
          >
            {hide ? "Show" : "Hide"}
          </button>
        </div>
      </div>
    </section>
  );
}
