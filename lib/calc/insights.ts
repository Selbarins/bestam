type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on: string;
  categories?: { name?: string } | { name?: string }[] | null;
};

type IncomeRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
};

function toMad(amount: number | string, rate?: number | string | null) {
  return Number(amount) * Number(rate ?? 1);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function categoryName(
  categories?: { name?: string } | { name?: string }[] | null
) {
  if (!categories) return "Other";
  if (Array.isArray(categories)) return categories[0]?.name || "Other";
  return categories.name || "Other";
}

export function calcInsights(
  expenses: ExpenseRow[],
  income: IncomeRow[],
  now = new Date()
) {
  const thisMonth = monthKey(now);

  const actualExpenses = expenses.filter((e) => e.status === "actual");

  const spentThisMonth = actualExpenses
    .filter((e) => e.spent_on?.startsWith(thisMonth))
    .reduce((s, e) => s + toMad(e.amount, e.rate_to_mad), 0);

  const incomeThisMonth = income
    .filter((i) => i.received_at && i.received_at.startsWith(thisMonth))
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);

  const byCategoryMap = new Map<string, number>();
  for (const e of actualExpenses) {
    if (!e.spent_on?.startsWith(thisMonth)) continue;
    const name = categoryName(e.categories);
    byCategoryMap.set(
      name,
      (byCategoryMap.get(name) || 0) + toMad(e.amount, e.rate_to_mad)
    );
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const monthlyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(monthKey(d), 0);
  }
  for (const e of actualExpenses) {
    const key = e.spent_on?.slice(0, 7);
    if (key && monthlyMap.has(key)) {
      monthlyMap.set(
        key,
        (monthlyMap.get(key) || 0) + toMad(e.amount, e.rate_to_mad)
      );
    }
  }
  const monthly = [...monthlyMap.entries()].map(([month, value]) => ({
    month,
    label: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
    value: Math.round(value * 100) / 100,
  }));

  return {
    spentThisMonth,
    incomeThisMonth,
    netThisMonth: incomeThisMonth - spentThisMonth,
    byCategory,
    monthly,
  };
}
