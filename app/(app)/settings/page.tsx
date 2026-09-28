import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

async function AccountSection() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Account</p>
      <p className="mt-1 text-sm font-medium">{email ?? "—"}</p>
      <div className="mt-4">
        <LogoutButton />
      </div>
    </section>
  );
}

async function CategoriesSection() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, bucket")
    .order("sort_order");

  const buckets: Record<string, { id: string; name: string }[]> = {
    essentials: [],
    lifestyle: [],
    growth: [],
    other: [],
  };

  for (const cat of categories ?? []) {
    if (buckets[cat.bucket]) {
      buckets[cat.bucket].push({ id: cat.id, name: cat.name });
    }
  }

  const labels: Record<string, string> = {
    essentials: "Essentials",
    lifestyle: "Lifestyle",
    growth: "Growth",
    other: "Other",
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Categories
        </h2>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          Used when adding expenses
        </p>
      </div>

      {Object.entries(buckets).map(([key, items]) =>
        items.length === 0 ? null : (
          <div
            key={key}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {labels[key]}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item.id}
                  className="rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-medium"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </section>
  );
}

function SectionSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Account · Categories
        </p>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <AccountSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Bestam · personal only
      </p>
    </div>
  );
}
