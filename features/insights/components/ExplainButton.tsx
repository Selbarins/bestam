"use client";

import { useState, useTransition } from "react";
import { explainThisMonth } from "../actions-explain";

export function ExplainButton() {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await explainThisMonth();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setText(res.text);
    });
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">AI summary</p>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="glass-btn rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-60"
        >
          {pending ? "…" : text ? "Refresh" : "Explain this month"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {text && (
        <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">
          {text}
        </p>
      )}
      {!text && !error && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          On demand — uses your numbers only. Needs GROQ_API_KEY on Vercel for
          polished wording.
        </p>
      )}
    </div>
  );
}
