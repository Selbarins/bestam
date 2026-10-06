"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import { formatMoney } from "@/lib/format";
import { toMad, roundMoney } from "@/lib/calc/money";

export type ExplorerExpense = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status?: string;
  spent_on?: string | null;
  note?: string | null;
  categoryName: string;
};

type Cat = { name: string; value: number };

type Props = {
  categories: Cat[];
  expenses: ExplorerExpense[];
  monthPrefix: string; // YYYY-MM
};

export function CategoryExplorer({
  categories,
  expenses,
  monthPrefix,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = categories.reduce((s, c) => s + c.value, 0);

  const daily = useMemo(() => {
    if (!selected) return [];
    const map = new Map<number, number>();
    for (const e of expenses) {
      if (e.status && e.status !== "actual") continue;
      if (!e.spent_on?.startsWith(monthPrefix)) continue;
      if (e.categoryName !== selected) continue;
      const day = Number(e.spent_on.slice(8, 10));
      if (!Number.isFinite(day)) continue;
      map.set(day, (map.get(day) || 0) + toMad(e.amount, e.rate_to_mad));
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, value]) => ({ day, value: roundMoney(value) }));
  }, [selected, expenses, monthPrefix]);

  const lines = useMemo(() => {
    if (!selected) return [];
    return expenses
      .filter(
        (e) =>
          (!e.status || e.status === "actual") &&
          e.spent_on?.startsWith(monthPrefix) &&
          e.categoryName === selected
      )
      .map((e) => ({
        note: e.note || selected,
        amount: roundMoney(toMad(e.amount, e.rate_to_mad)),
        day: e.spent_on?.slice(8, 10) ?? "",
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [selected, expenses, monthPrefix]);

  if (!categories.length) {
    return (
      <p className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No spending this month
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {categories.slice(0, 8).map((c) => {
          const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
          const on = selected === c.name;
          return (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => setSelected(on ? null : c.name)}
                className={`w-full rounded-xl px-2 py-2 text-left transition ${
                  on ? "bg-[hsl(var(--accent))]" : "hover:bg-white/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-[hsl(var(--muted-foreground))]">
                    {formatMoney(c.value)} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="space-y-2 border-t border-[hsl(var(--border))] pt-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {selected} · this month
          </p>
          {daily.length > 0 ? (
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "hsl(30 8% 45%)" }}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    labelFormatter={(d) => `Day ${d}`}
                    contentStyle={{
                      borderRadius: 10,
                      fontSize: 11,
                      border: "1px solid hsl(40 15% 90%)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(152, 25%, 38%)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              No daily breakdown
            </p>
          )}
          <ul className="space-y-1.5">
            {lines.map((l, i) => (
              <li
                key={`${l.note}-${l.day}-${i}`}
                className="flex justify-between gap-2 text-xs"
              >
                <span className="truncate text-[hsl(var(--muted-foreground))]">
                  {l.day ? `${l.day} · ` : ""}
                  {l.note}
                </span>
                <span className="tabular-nums font-medium">
                  {formatMoney(l.amount)}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-[hsl(var(--muted-foreground))] underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
