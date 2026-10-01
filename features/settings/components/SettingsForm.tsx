"use client";

import { useState, useTransition } from "react";
import { upsertSettings } from "../actions";

type Props = {
  safety_buffer: number;
  pay_cycle_days: number;
};

export function SettingsForm({ safety_buffer, pay_cycle_days }: Props) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setMsg(null);
    startTransition(async () => {
      const result = await upsertSettings(formData);
      if (result.error) setMsg(result.error);
      else setMsg("Saved");
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Safety buffer (MAD)
        </label>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Money you refuse to spend. Subtracted from Safe-to-Spend.
        </p>
        <input
          name="safety_buffer"
          type="number"
          step="0.01"
          min="0"
          defaultValue={safety_buffer}
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm tabular-nums"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Pay cycle length (days)
        </label>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Days after last salary until the next expected payday. Default 28
          (flexible for weekends).
        </p>
        <input
          name="pay_cycle_days"
          type="number"
          min="14"
          max="45"
          defaultValue={pay_cycle_days}
          className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm tabular-nums"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[hsl(var(--primary))] py-3 text-sm font-medium text-[hsl(var(--primary-foreground))] active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
      {msg && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{msg}</p>
      )}
    </form>
  );
}
