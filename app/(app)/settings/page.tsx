import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { getAccounts } from "@/features/accounts/queries";
import { LogoutButton } from "@/components/logout-button";
import { formatMoney } from "@/lib/format";
import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { CategoryRow } from "@/features/categories/components/CategoryRow";

const BUCKET_ORDER = [
  { key: "essentials", label: "Essentials" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "growth", label: "Growth" },
  { key: "other", label: "Other" },
] as const;

export default async function SettingsPage() {
  const supabase = await createClient();

  const [settings, accounts, { data: categories }] = await Promise.all([
    getSettings(),
    getAccounts(),
    supabase
      .from("categories")
      .select("id, name, bucket, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const list = categories ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Buffer, categories, accounts
        </p>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Planning</h2>
        <p className="mt-1 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          Safety buffer is money you refuse to spend. Pay cycle is days after
          your last salary until the next expected payday.
        </p>
        <SettingsForm
          safety_buffer={settings.safety_buffer}
          pay_cycle_days={settings.pay_cycle_days}
        />
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Categories</h2>
        <p className="mt-1 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          Rename, move bucket, or delete. Buckets group the expense form and
          charts.
        </p>

        <div className="space-y-4">
          {BUCKET_ORDER.map((group) => {
            const items = list.filter(
              (c) => (c.bucket || "other").toLowerCase() === group.key
            );
            if (items.length === 0) return null;
            return (
              <div key={group.key}>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {items.map((c) => (
                    <CategoryRow
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      bucket={c.bucket}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <CategoryForm />
        </div>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Accounts</h2>
        <p className="mt-1 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
          Bank and Cash count toward Safe-to-Spend. Savings does not.
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No accounts yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {a.name}
                  <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                    {a.include_in_safe_to_spend
                      ? "in Safe-to-Spend"
                      : "excluded"}
                  </span>
                </span>
                <span className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {a.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Manage</h2>
        <ul className="mt-3 space-y-1">
          <li>
            <Link
              href="/money/recurring"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-white/40"
            >
              Recurring bills & salary
            </Link>
          </li>
          <li>
            <Link
              href="/money/cart"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-white/40"
            >
              Shopping cart
            </Link>
          </li>
        </ul>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Current values</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">
              Safety buffer
            </dt>
            <dd className="tabular-nums font-medium">
              {formatMoney(settings.safety_buffer)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">Pay cycle</dt>
            <dd className="tabular-nums font-medium">
              {settings.pay_cycle_days} days
            </dd>
          </div>
        </dl>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-sm font-medium">Session</h2>
        <p className="mt-1 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          Solo account. Sign-ups are disabled.
        </p>
        <LogoutButton />
      </section>
    </div>
  );
}
