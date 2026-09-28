"use client";

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

export function CategoryLegend({ data }: { data: Item[] }) {
  if (!data.length) return null;

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={item.name} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="truncate text-sm">{item.name}</span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium tabular-nums">
              {formatMoney(item.value)}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {Math.round((item.value / total) * 100)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
