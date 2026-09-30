import { formatMoney } from "@/lib/format";
import { toMad } from "./money";

type Expense = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  categories?: { name?: string } | { name?: string }[] | null;
};

type Income = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
};

function categoryName(
  categories?: { name?: string } | { name?: string }[] | null
) {
  if (!categories) return "Uncategorized";
  if (Array.isArray(categories)) return categories[0]?.name || "Uncategorized";
  return categories.name || "Uncategorized";
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function buildWeeklyReview(expenses: Expense[], income: Income[]) {
  const weekStart = startOfWeek();
  const weekIso = weekStart.toISOString().slice(0, 10);

  const weekExpenses = expenses.filter(
    (e) => e.status === "actual" && e.spent_on && e.spent_on >= weekIso
  );

  const spent = weekExpenses.reduce(
    (s, e) => s + toMad(e.amount, e.rate_to_mad),
    0
  );

  const byCat: Record<string, number> = {};
  for (const e of weekExpenses) {
    const name = categoryName(e.categories);
    byCat[name] = (byCat[name] || 0) + toMad(e.amount, e.rate_to_mad);
  }

  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  const received = income
    .filter((i) => i.received_at && i.received_at.slice(0, 10) >= weekIso)
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);

  const lines: string[] = [];

  if (weekExpenses.length === 0) {
    lines.push("Quiet week — no expenses logged yet.");
  } else {
    lines.push(
      `You spent ${formatMoney(spent)} across ${weekExpenses.length} expense${weekExpenses.length > 1 ? "s" : ""}.`
    );
    if (top) {
      lines.push(`Biggest category: ${top[0]} (${formatMoney(top[1])}).`);
    }
  }

  if (received > 0) {
    lines.push(`Income received this week: ${formatMoney(received)}.`);
  }

  if (spent > 0 && received > 0) {
    const net = received - spent;
    lines.push(
      net >= 0
        ? `Net this week: +${formatMoney(net)}.`
        : `Net this week: ${formatMoney(net)} — you ran ahead of income.`
    );
  }

  if (top && top[1] > spent * 0.4 && spent > 0) {
    lines.push(
      `Suggestion: ${top[0]} is over 40% of weekly spend — worth a soft cap?`
    );
  } else if (weekExpenses.length === 0) {
    lines.push("Suggestion: log one small expense today to keep the habit.");
  } else {
    lines.push(
      "Suggestion: check Safe-to-Spend before the next discretionary buy."
    );
  }

  return {
    weekStart: weekIso,
    spent,
    received,
    topCategory: top ? top[0] : null,
    lines,
  };
}
