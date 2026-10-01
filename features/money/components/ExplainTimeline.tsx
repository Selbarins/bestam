import { formatMoney } from "@/lib/format";
import type { TimelinePoint } from "@/lib/calc/timeline";
import type { SafeToSpendV2Result } from "@/lib/calc/safe-to-spend-v2";

type Props = {
  safe: SafeToSpendV2Result;
  /** Show every day, or only days with events + lowest */
  compact?: boolean;
};

export function ExplainTimeline({ safe, compact = true }: Props) {
  const { timeline, safetyBuffer, discretionary, daily, daysLeft } = safe;

  const points = compact
    ? timeline.points.filter(
        (p) =>
          p.events.length > 0 ||
          p.date === timeline.lowestDate ||
          p.date === timeline.points[0]?.date
      )
    : timeline.points;

  // Dedupe if lowest is already an event day
  const seen = new Set<string>();
  const rows: TimelinePoint[] = [];
  for (const p of points) {
    if (seen.has(p.date)) continue;
    seen.add(p.date);
    rows.push(p);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-3 text-sm space-y-1">
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">Start </span>
          <span className="tabular-nums font-medium">
            {formatMoney(safe.startBalance)}
          </span>
        </p>
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">
            Lowest projected{" "}
          </span>
          <span className="tabular-nums font-medium">
            {formatMoney(safe.lowestBalance)}
          </span>
          {safe.lowestDate && (
            <span className="text-[hsl(var(--muted-foreground))]">
              {" "}
              on {safe.lowestDate}
            </span>
          )}
        </p>
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">
            Safety buffer{" "}
          </span>
          <span className="tabular-nums font-medium">
            −{formatMoney(safetyBuffer)}
          </span>
        </p>
        <p>
          <span className="text-[hsl(var(--muted-foreground))]">
            Discretionary{" "}
          </span>
          <span className="tabular-nums font-medium">
            {formatMoney(discretionary)}
          </span>
        </p>
        <p className="pt-1 border-t border-[hsl(var(--border))]">
          <span className="text-[hsl(var(--muted-foreground))]">
            ÷ {daysLeft} days →{" "}
          </span>
          <span className="tabular-nums font-semibold">
            {formatMoney(daily)} / day
          </span>
        </p>
      </div>

      <div>
        <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
          {compact ? "Key dates" : "Day by day"}
        </h3>
        {rows.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No upcoming events in this cycle.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((p) => {
              const isLowest = p.date === timeline.lowestDate;
              return (
                <li
                  key={p.date}
                  className={`text-sm rounded-xl border px-3 py-2 ${
                    isLowest
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">
                      {p.date}
                      {isLowest && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-[hsl(var(--primary))]">
                          lowest
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {formatMoney(p.balance)}
                    </span>
                  </div>
                  {p.events.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {p.events.map((e, i) => (
                        <li
                          key={`${e.label}-${i}`}
                          className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]"
                        >
                          <span>
                            {e.kind}: {e.label}
                          </span>
                          <span className="tabular-nums">
                            {e.amount >= 0 ? "+" : ""}
                            {formatMoney(e.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
