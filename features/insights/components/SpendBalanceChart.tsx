"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  buildSpendBalanceSeries,
  listCategoryNames,
  type SpendTx,
  type IncomeTx,
} from "@/lib/calc/spend-balance-series";
import { formatMoney } from "@/lib/format";

type Props = {
  year: number;
  monthIndex0: number;
  expenses: SpendTx[];
  income: IncomeTx[];
};

export function SpendBalanceChart({
  year,
  monthIndex0,
  expenses,
  income,
}: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const prefix = `${year}-${String(monthIndex0 + 1).padStart(2, "0")}`;
  const categories = useMemo(
    () => listCategoryNames(expenses, prefix),
    [expenses, prefix]
  );

  const data = useMemo(
    () =>
      buildSpendBalanceSeries({
        year,
        monthIndex0,
        expenses,
        income,
        categoryFilter: category,
      }),
    [year, monthIndex0, expenses, income, category]
  );

  const totalSpent = data.reduce((s, d) => s + d.spent, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">Spent vs month net</h2>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Bars = daily spend · line = income − spend (this month)
          </p>
        </div>
        <p className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
          {formatMoney(totalSpent)}
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            category === null
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "glass text-[hsl(var(--muted-foreground))]"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c === category ? null : c)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              category === c
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "glass text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 90%)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(30 8% 45%)" }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatMoney(value),
                name === "spent" ? "Spent" : "Month net",
              ]}
              labelFormatter={(day) => `Day ${day}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(40 15% 90%)",
                background: "hsl(40 30% 99% / 0.95)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="spent"
              fill="hsl(152, 25%, 38%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
              opacity={0.85}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(30, 10%, 25%)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
