"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { formatMoney } from "@/lib/format";

type Point = {
  date: string;
  balance: number;
  phase: "past" | "today" | "future";
};

type Props = {
  series: Point[];
};

export function BalanceSparkline({ series }: Props) {
  if (series.length < 2) {
    return (
      <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Not enough history yet
      </p>
    );
  }

  const data = series.map((p) => ({
    ...p,
    label: p.date.slice(5),
  }));

  const today = series.find((p) => p.phase === "today");

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" stopOpacity={1} />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(30 8% 45%)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={["dataMin - 150", "dataMax + 150"]} />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid hsl(40 15% 90%)",
              background: "hsl(40 30% 99%)",
              fontSize: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            formatter={(v: number) => [formatMoney(v), "Balance"]}
            labelFormatter={(_, pl) => pl?.[0]?.payload?.date ?? ""}
          />
          {today && (
            <ReferenceLine
              x={today.date.slice(5)}
              stroke="hsl(152 25% 38%)"
              strokeDasharray="3 4"
              strokeOpacity={0.5}
            />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(152 25% 38%)"
            strokeWidth={2.25}
            fill="url(#balFill)"
            animationDuration={700}
            dot={false}
            activeDot={{ r: 5, fill: "hsl(152 25% 38%)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
