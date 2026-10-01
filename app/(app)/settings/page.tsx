import Link from "next/link";
import { getSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { getAccounts } from "@/features/accounts/queries";
import { LogoutButton } from "@/components/logout-button";
import { formatMoney } from "@/lib/format";

export default async function SettingsPage() {
  const [settings, accounts] = await Promise.all([
    getSettings(),
    getAccounts(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Buffer, pay cycle, and account
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Home
        </Link>
      </div>

      {/* Safety buffer + pay cycle */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Planning</h2>
        <p className="mt-1 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          Safety buffer is money you refuse to spend. Pay cycle is days after
          your last salary until the next expected payday (default 28).
        </p>
        <SettingsForm
          safety_buffer={settings.safety_buffer}
          pay_cycle_days={settings.pay_cycle_days}
        />
      </section>

      {/* Accounts overview */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Accounts</h2>
        <p className="mt-1 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
          Bank and Cash count toward Safe-to-Spend. Savings does not.
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No accounts yet — run the accounts migration.
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
        <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          Reconcile balances from the home screen.
        </p>
      </section>

      {/* Shortcuts */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Manage</h2>
        <ul className="mt-3 space-y-1">
          <li>
            <Link
              href="/money/recurring"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
            >
              Recurring bills & salary
            </Link>
          </li>
          <li>
            <Link
              href="/money/cart"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
            >
              Shopping cart
            </Link>
          </li>
          <li>
            <Link
              href="/money/expenses"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
            >
              Add expense
            </Link>
          </li>
          <li>
            <Link
              href="/money/income"
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
            >
              Add income
            </Link>
          </li>
        </ul>
      </section>

      {/* Current planning summary */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
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
            <dt className="text-[hsl(var(--muted-foreground))]">
              Pay cycle
            </dt>
            <dd className="tabular-nums font-medium">
              {settings.pay_cycle_days} days
            </dd>
          </div>
        </dl>
      </section>

      {/* Logout */}
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-sm font-medium">Session</h2>
        <p className="mt-1 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
          Solo account. Sign-ups are disabled.
        </p>
        <LogoutButton />
      </section>
    </div>
  );
}
