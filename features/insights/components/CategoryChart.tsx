"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatMoney } from "@/lib/format";

const COLORS = [
  "hsl(152, 25%, 38%)",
  "hsl(152, 20%, 55%)",
  "hsl(40, 30%, 55%)",
  "hsl(30, 15%, 45%)",
  "hsl(152, 15%, 70%)",
  "hsl(40, 20%, 75%)",
  "hsl(30, 10%, 60%)",
  "hsl(152, 10%, 50%)",
];

type Item = { name: string; value: number };

export function CategoryChart({ data }: { data: Item[] }) {
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No spending this month yet
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatMoney(value)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(40 15% 90%)",
              background: "hsl(40 30% 99%)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
