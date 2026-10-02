import type { AffordResult } from "@/features/money/actions-afford";

/** Always works — no API key needed. */
export function templateAffordCoach(
  r: Pick<AffordResult, "status"> | AffordResult
): string {
  if (r.status === "overdrawn") {
    return "This would push you below zero before payday.";
  }
  if (r.status === "buffer") {
    return "Possible, but it eats into your safety buffer.";
  }
  if (r.status === "tight") {
    return "Fits, with a noticeable dent in daily room.";
  }
  return "Comfortable — the timeline still looks healthy.";
}

/** Tries Groq; falls back to template. */
export async function polishAffordCoach(r: AffordResult): Promise<string> {
  const fallback = templateAffordCoach(r);
  const key = process.env.GROQ_API_KEY;
  if (!key) return fallback;

  try {
    const prompt = `One calm sentence (max 18 words) about this purchase. Facts only:
status=${r.status}
amount=${r.amount}
daily ${r.beforeDaily} to ${r.afterDaily}
lowest ${r.beforeLowest} to ${r.afterLowest}
Reply with the sentence only.`;

    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0.3,
          max_tokens: 60,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
    if (!res.ok) return fallback;
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content?.trim();
    if (!text || text.length > 120) return fallback;
    return text;
  } catch {
    return fallback;
  }
}
