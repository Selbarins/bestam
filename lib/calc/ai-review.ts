import type { buildWeeklyReview } from "./weekly-review";

type Review = ReturnType<typeof buildWeeklyReview>;

/**
 * Optional polish via Groq (free tier).
 * Falls back to rule-based lines if no key / error.
 *
 * Env: GROQ_API_KEY
 * Get free key: https://console.groq.com
 */
export async function polishWeeklyReview(
  review: Review
): Promise<string[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return review.lines;

  const facts = review.lines.join(" ");
  // Keep prompt tiny → cheap tokens
  const prompt = `You are a calm personal finance coach. Rewrite these facts into 3 short plain sentences. No bullets, no emojis, no hype. One concrete suggestion at the end.\n\nFacts: ${facts}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 180,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return review.lines;

    const data = await res.json();
    const text: string =
      data?.choices?.[0]?.message?.content?.trim() || "";
    if (!text) return review.lines;

    // Split into short paragraphs/sentences for the UI
    return text
      .split(/\n+/)
      .flatMap((p: string) => p.split(/(?<=\.)\s+/))
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return review.lines;
  }
}
