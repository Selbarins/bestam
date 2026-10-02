"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import type { TimelinePoint } from "@/lib/calc/timeline";
import { formatMoney } from "@/lib/format";

type Props = {
  points: TimelinePoint[];
  lowestDate: string | null;
  lowestBalance: number;
};

export function BalanceSparkline({
  points,
  lowestDate,
  lowestBalance,
}: Props) {
  if (points.length < 2) {
    return (
      <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Not enough timeline data yet
      </p>
    );
  }

  const data = points.map((p) => ({
    date: p.date.slice(5), // MM-DD
    full: p.date,
    balance: p.balance,
    hasEvent: p.events.length > 0,
  }));

  const lowest = data.find((d) => d.full === lowestDate);

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(152 25% 38%)"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="hsl(152 25% 38%)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(30 8% 45%)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(40 15% 90%)",
              fontSize: 12,
            }}
            formatter={(v: number) => [formatMoney(v), "Balance"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.full ?? ""
            }
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(152 25% 38%)"
            strokeWidth={2}
            fill="url(#balFill)"
            animationDuration={600}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(152 25% 38%)" }}
          />
          {lowest && (
            <ReferenceDot
              x={lowest.date}
              y={lowest.balance}
              r={5}
              fill="hsl(30 10% 12%)"
              stroke="hsl(40 33% 98%)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
        Lowest {formatMoney(lowestBalance)}
        {lowestDate ? ` · ${lowestDate}` : ""}
      </p>
    </div>
  );
}
