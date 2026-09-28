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
  const [isPending, startTransition] = useTransition();

  // Clear optimistic state once the real route catches up
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const current = pendingHref ?? pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? current === "/"
              : current.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                // Instant visual feedback
                setPendingHref(href);
                startTransition(() => {
                  router.push(href);
                });
              }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                active
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
