"use client";

import { useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function HomeSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left active:bg-[hsl(var(--muted))]/40"
      >
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && <div className="border-t border-[hsl(var(--border))] px-5 py-4">{children}</div>}
    </section>
  );
}
