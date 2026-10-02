import { toMad, roundMoney } from "./money";

type Exp = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  categories?: { name?: string } | { name?: string }[] | null;
};

function catName(
  categories?: { name?: string } | { name?: string }[] | null
) {
  if (!categories) return "Other";
  if (Array.isArray(categories)) return categories[0]?.name || "Other";
  return categories.name || "Other";
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type CategoryDelta = {
  name: string;
  thisMonth: number;
  lastMonth: number;
  delta: number;
};

export function calcWhatChanged(expenses: Exp[], now = new Date()) {
  const thisKey = monthKey(now);
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastKey = monthKey(last);

  const map = new Map<string, { thisMonth: number; lastMonth: number }>();

  for (const e of expenses) {
    if (e.status !== "actual" || !e.spent_on) continue;
    const key = e.spent_on.slice(0, 7);
    if (key !== thisKey && key !== lastKey) continue;
    const name = catName(e.categories);
    const cur = map.get(name) ?? { thisMonth: 0, lastMonth: 0 };
    const mad = toMad(e.amount, e.rate_to_mad);
    if (key === thisKey) cur.thisMonth += mad;
    else cur.lastMonth += mad;
    map.set(name, cur);
  }

  const rows: CategoryDelta[] = [...map.entries()]
    .map(([name, v]) => ({
      name,
      thisMonth: roundMoney(v.thisMonth),
      lastMonth: roundMoney(v.lastMonth),
      delta: roundMoney(v.thisMonth - v.lastMonth),
    }))
    .filter((r) => r.thisMonth > 0 || r.lastMonth > 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return rows.slice(0, 8);
}
