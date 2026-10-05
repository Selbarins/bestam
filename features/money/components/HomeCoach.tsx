"use client";

type Props = { line: string };

export function HomeCoach({ line }: Props) {
  if (!line) return null;
  return (
    <p className="px-1 text-center text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
      {line}
    </p>
  );
}
