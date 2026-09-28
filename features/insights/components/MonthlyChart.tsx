"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatMoney } from "@/lib/format";

type Item = { label: string; value: number };

export function MonthlyChart({ data }: { data: Item[] }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(30 8% 45%)" }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => formatMoney(value)}
            cursor={{ fill: "hsl(40 18% 94%)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(40 15% 90%)",
              background: "hsl(40 30% 99%)",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="value"
            fill="hsl(152, 25%, 38%)"
            radius={[8, 8, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
