import { toMad, roundMoney } from "./money";

type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  note?: string | null;
  categories?:
    | { name?: string; bucket?: string }
    | { name?: string; bucket?: string }[]
    | null;
};

type IncomeRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function categoryName(
  categories?:
    | { name?: string; bucket?: string }
    | { name?: string; bucket?: string }[]
    | null
) {
  if (!categories) return "Other";
  if (Array.isArray(categories)) return categories[0]?.name || "Other";
  return categories.name || "Other";
}

function categoryBucket(
  categories?:
    | { name?: string; bucket?: string }
    | { name?: string; bucket?: string }[]
    | null
) {
  if (!categories) return "other";
  if (Array.isArray(categories))
    return (categories[0]?.bucket || "other").toLowerCase();
  return (categories.bucket || "other").toLowerCase();
}

export function calcInsights(
  expenses: ExpenseRow[],
  income: IncomeRow[],
  now = new Date()
) {
  const thisMonth = monthKey(now);
  const actualExpenses = expenses.filter((e) => e.status === "actual");
  const monthExpenses = actualExpenses.filter((e) =>
    e.spent_on?.startsWith(thisMonth)
  );

  const spentThisMonth = monthExpenses.reduce(
    (s, e) => s + toMad(e.amount, e.rate_to_mad),
    0
  );

  const incomeThisMonth = income
    .filter((i) => i.received_at && i.received_at.startsWith(thisMonth))
    .reduce((s, i) => s + toMad(i.amount, i.rate_to_mad), 0);

  // By category
  const byCategoryMap = new Map<string, number>();
  for (const e of monthExpenses) {
    const name = categoryName(e.categories);
    byCategoryMap.set(
      name,
      (byCategoryMap.get(name) || 0) + toMad(e.amount, e.rate_to_mad)
    );
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([name, value]) => ({ name, value: roundMoney(value) }))
    .sort((a, b) => b.value - a.value);

  // By bucket
  const byBucketMap = new Map<string, number>();
  for (const e of monthExpenses) {
    const b = categoryBucket(e.categories);
    byBucketMap.set(b, (byBucketMap.get(b) || 0) + toMad(e.amount, e.rate_to_mad));
  }
  const byBucket = ["essentials", "lifestyle", "growth", "other"]
    .map((name) => ({
      name,
      value: roundMoney(byBucketMap.get(name) || 0),
    }))
    .filter((r) => r.value > 0);

  // Top notes
  const noteMap = new Map<string, number>();
  for (const e of monthExpenses) {
    const key = (e.note || "").trim() || categoryName(e.categories);
    noteMap.set(key, (noteMap.get(key) || 0) + toMad(e.amount, e.rate_to_mad));
  }
  const topNotes = [...noteMap.entries()]
    .map(([name, value]) => ({ name, value: roundMoney(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Weekday pattern (0 = Sun … 6 = Sat)
  const weekdaySum = Array.from({ length: 7 }, () => 0);
  const weekdayCount = Array.from({ length: 7 }, () => 0);
  for (const e of actualExpenses) {
    if (!e.spent_on) continue;
    const d = new Date(e.spent_on + "T12:00:00");
    if (Number.isNaN(d.getTime())) continue;
    const w = d.getDay();
    weekdaySum[w] += toMad(e.amount, e.rate_to_mad);
    weekdayCount[w] += 1;
  }
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byWeekday = weekdayLabels.map((label, i) => ({
    label,
    value: roundMoney(
      weekdayCount[i] > 0 ? weekdaySum[i] / weekdayCount[i] : 0
    ),
    total: roundMoney(weekdaySum[i]),
  }));

  // Last 6 months
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
    value: roundMoney(value),
  }));

  const spendRate =
    incomeThisMonth > 0
      ? roundMoney((spentThisMonth / incomeThisMonth) * 100)
      : null;

  return {
    spentThisMonth: roundMoney(spentThisMonth),
    incomeThisMonth: roundMoney(incomeThisMonth),
    netThisMonth: roundMoney(incomeThisMonth - spentThisMonth),
    spendRate,
    byCategory,
    byBucket,
    topNotes,
    byWeekday,
    monthly,
  };
}
