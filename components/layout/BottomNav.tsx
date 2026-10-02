"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Home, Wallet, Target, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
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
    ["/money", "/goals", "/insights", "/settings"].forEach((href) => {
      router.prefetch(href);
    });
  }, [router]);

  const current = pendingHref ?? pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className="mx-auto flex max-w-lg items-center justify-around rounded-2xl px-1 py-1.5"
        style={{
          background: "hsl(40 30% 99% / 0.72)",
          border: "1px solid hsl(0 0% 100% / 0.5)",
          boxShadow:
            "0 1px 0 hsl(0 0% 100% / 0.55) inset, 0 12px 40px -12px hsl(30 10% 12% / 0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? current === "/" : current.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                setPendingHref(href);
                startTransition(() => {
                  router.push(href);
                });
              }}
              className={cn(
                "flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] transition-all",
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
    </nav>
  );
}
