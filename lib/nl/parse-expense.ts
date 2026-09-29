export type ParsedExpense = {
  amount: number;
  note: string | null;
  /** lowercase tokens for category matching */
  tokens: string[];
};

/**
 * Parse "coffee 25", "25 coffee", "lunch 45.5 MAD"
 */
export function parseExpenseText(input: string): ParsedExpense | null {
  const raw = input.trim().replace(/\s+/g, " ");
  if (!raw) return null;

  const amountMatch = raw.match(/(\d+(?:[.,]\d+)?)/);
  if (!amountMatch) return null;

  const amount = Number(amountMatch[1].replace(",", "."));
  if (!amount || amount <= 0) return null;

  const note = raw
    .replace(amountMatch[0], "")
    .replace(/\b(mad|dh|dirhams?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || null;

  const tokens = (note ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return { amount, note, tokens };
}

/** Pick category whose name shares a token with the note */
export function matchCategory(
  tokens: string[],
  categories: { id: string; name: string }[]
): string | null {
  if (!tokens.length) return null;
  for (const cat of categories) {
    const name = cat.name.toLowerCase();
    if (tokens.some((t) => name.includes(t) || t.includes(name.split(" ")[0]))) {
      return cat.id;
    }
  }
  return null;
}
