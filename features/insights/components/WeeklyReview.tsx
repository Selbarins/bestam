type Props = {
  lines: string[];
  weekStart: string;
};

export function WeeklyReview({ lines, weekStart }: Props) {
  const label = new Date(weekStart).toLocaleDateString("fr-MA", {
    day: "numeric",
    month: "short",
  });

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <h2 className="text-sm font-medium">Weekly review</h2>
      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
        Week of {label}
      </p>
      <ul className="mt-4 space-y-2">
        {lines.map((line, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed text-[hsl(var(--foreground))]"
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
