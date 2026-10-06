"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Home, Wallet, Target, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const sideItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    ["/money", "/goals", "/insights", "/money/expenses", "/settings"].forEach(
      (href) => router.prefetch(href)
    );
  }, [router]);

  const current = pendingHref ?? pathname;

  function go(href: string) {
    setPendingHref(href);
    startTransition(() => router.push(href));
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className="relative mx-auto flex max-w-lg items-end justify-between rounded-2xl px-2 pb-1.5 pt-1.5"
        style={{
          background: "hsl(40 30% 99% / 0.72)",
          border: "1px solid hsl(0 0% 100% / 0.5)",
          boxShadow:
            "0 1px 0 hsl(0 0% 100% / 0.55) inset, 0 12px 40px -12px hsl(30 10% 12% / 0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left pair */}
        <div className="flex flex-1 justify-around">
          {sideItems.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? current === "/" : current.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => go(href)}
                className={cn(
                  "flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px]",
                  active
                    ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center capture */}
        <div className="flex w-16 shrink-0 justify-center">
          <Link
            href="/money/expenses"
            onClick={() => go("/money/expenses")}
            className="glass-btn -mt-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            aria-label="Add expense"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Right pair */}
        <div className="flex flex-1 justify-around">
          {sideItems.slice(2).map(({ href, label, icon: Icon }) => {
            const active = current.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => go(href)}
                className={cn(
                  "flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px]",
                  active
                    ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
