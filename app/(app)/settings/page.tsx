import { LogoutButton } from "@/components/logout-button";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Categories · Salary · Theme
        </p>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
          Account
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
