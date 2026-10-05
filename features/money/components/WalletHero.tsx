"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { SafeToSpendV2Result } from "@/lib/calc/safe-to-spend-v2";
import type { PaceResult } from "@/lib/calc/pace";

type Props = {
  safe: SafeToSpendV2Result;
  cycleStart: string;
  cycleEnd: string;
  pace: PaceResult;
};

export function WalletHero({ safe, cycleStart, cycleEnd, pace }: Props) {
  const [mode, setMode] = useState<"today" | "until">("today");
  const [hidden, setHidden] = useState(false);

  const daily = safe.daily;
  const until = Math.max(0, safe.discretionary);
  const isZero = daily <= 0;
  const show = (n: number) => (hidden ? "••••" : formatMoney(n));

  const paceLabel =
    pace.status === "ahead"
      ? "Spending income faster than the clock"
      : pace.status === "under"
        ? "Income lasting longer than the clock"
        : "Income and calendar in sync";

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] p-5 text-[hsl(var(--foreground))] shadow-[0_20px_50px_-20px_rgba(40,60,40,0.35)]"
      style={{
        background:
          "linear-gradient(145deg, hsl(152 28% 42% / 0.92) 0%, hsl(152 22% 32% / 0.88) 48%, hsl(40 25% 96% / 0.55) 160%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid hsl(0 0% 100% / 0.35)",
      }}
    >
      {/* Glass highlights */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">
            Safe to spend
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white/95 backdrop-blur-sm active:scale-[0.97]"
            >
              {hidden ? "Show" : "Hide"}
            </button>
            <div className="flex rounded-full bg-black/20 p-0.5 text-[11px] backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setMode("today")}
                className={`rounded-full px-2.5 py-1 transition ${
                  mode === "today"
                    ? "bg-white text-[hsl(152_25%_28%)] shadow-sm"
                    : "text-white/80"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMode("until")}
                className={`rounded-full px-2.5 py-1 transition ${
                  mode === "until"
                    ? "bg-white text-[hsl(152_25%_28%)] shadow-sm"
                    : "text-white/80"
                }`}
              >
                Until payday
              </button>
            </div>
          </div>
        </div>

        {isZero && mode === "today" ? (
          <div className="mt-5">
            <p className="text-2xl font-semibold tracking-tight text-white">
              Nothing free today
            </p>
            <p className="mt-1 text-sm text-white/80">
              Hold until the cycle eases.
            </p>
          </div>
        ) : (
          <p className="mt-5 text-[2.75rem] font-semibold leading-none tracking-tight text-white tabular-nums">
            {mode === "today" ? show(daily) : show(until)}
            <span className="ml-2 text-base font-medium text-white/75">
              {mode === "today" ? "/day" : " total"}
            </span>
          </p>
        )}

        <p className="mt-4 text-[12px] text-white/85">
          Spendable {show(safe.startBalance)}
          <span className="text-white/50"> · </span>
          Cycle {cycleStart.slice(5)} → {cycleEnd.slice(5)}
          <span className="text-white/50"> · </span>
          {safe.daysLeft}d left
        </p>

        {/* Pace on wallet */}
        <div className="mt-5 rounded-2xl bg-white/12 p-3 backdrop-blur-md ring-1 ring-white/20">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-white/90">Pace</p>
            <p className="text-[11px] text-white/75">{paceLabel}</p>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-white/80">
            <span>
              Of income{" "}
              <strong className="text-white tabular-nums">
                {Math.round(pace.usedRatio * 100)}%
              </strong>
            </span>
            <span>
              Time used{" "}
              <strong className="text-white tabular-nums">
                {Math.round(pace.timeElapsedRatio * 100)}%
              </strong>
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(pace.usedRatio * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
