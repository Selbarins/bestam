"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatMoney } from "@/lib/format";

type Point = { label: string; spent: number; income: number };

export function IncomeSpendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(30 8% 45%)" }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(v: number, name: string) => [
              formatMoney(v),
              name === "income" ? "Income" : "Spent",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(40 15% 90%)",
              background: "hsl(40 30% 99% / 0.96)",
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            formatter={(v) => (v === "income" ? "Income" : "Spent")}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar
            dataKey="income"
            fill="hsl(152, 25%, 48%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={16}
          />
          <Bar
            dataKey="spent"
            fill="hsl(30, 12%, 42%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
