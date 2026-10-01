import Link from "next/link";
import { getSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/features/settings/components/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Buffer and pay cycle
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Home
        </Link>
      </div>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <SettingsForm
          safety_buffer={settings.safety_buffer}
          pay_cycle_days={settings.pay_cycle_days}
        />
      </section>
    </div>
  );
}
