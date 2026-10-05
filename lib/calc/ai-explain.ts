export type MonthFacts = {
  spentThisMonth: number;
  incomeThisMonth: number;
  netThisMonth: number;
  spendRate: number | null;
  topCategories: { name: string; value: number }[];
  topDeltas: { name: string; delta: number }[];
};

export function templateMonthExplain(f: MonthFacts): string {
  const net =
    f.netThisMonth >= 0
      ? `net +${Math.round(f.netThisMonth)} MAD`
      : `net ${Math.round(f.netThisMonth)} MAD`;
  const rate =
    f.spendRate != null ? ` spending ${f.spendRate}% of income.` : ".";
  const top = f.topCategories[0]
    ? ` Largest category: ${f.topCategories[0].name}.`
    : "";
  const delta = f.topDeltas[0]
    ? f.topDeltas[0].delta > 0
      ? ` ${f.topDeltas[0].name} is up vs last month.`
      : ` ${f.topDeltas[0].name} is down vs last month.`
    : "";
  return `This month: ${Math.round(f.spentThisMonth)} spent, ${Math.round(f.incomeThisMonth)} income (${net})${rate}${top}${delta}`;
}

export async function polishMonthExplain(f: MonthFacts): Promise<string> {
  const fallback = templateMonthExplain(f);
  const key = process.env.GROQ_API_KEY;
  if (!key) return fallback;

  try {
    const facts = JSON.stringify({
      spent: f.spentThisMonth,
      income: f.incomeThisMonth,
      net: f.netThisMonth,
      spendRatePct: f.spendRate,
      topCategories: f.topCategories.slice(0, 3),
      biggestChanges: f.topDeltas.slice(0, 3),
    });

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
          temperature: 0.2,
          max_tokens: 120,
          messages: [
            {
              role: "system",
              content:
                "You are a calm finance narrator. Use ONLY the JSON facts. 2 short sentences max. No advice, no new numbers, no emojis.",
            },
            {
              role: "user",
              content: `Facts (MAD): ${facts}`,
            },
          ],
        }),
      }
    );
    if (!res.ok) return fallback;
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content?.trim();
    if (!text || text.length > 280) return fallback;
    return text;
  } catch {
    return fallback;
  }
}
