import { toMad, roundMoney } from "./money";

type IncomeRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
  account_id?: string | null;
};

type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: "planned" | "actual";
  account_id?: string | null;
};

type AdjustmentRow = {
  amount: number | string;
  account_id?: string | null;
};

export type AccountFilter = {
  /** If set, only rows for this account (plus rows with null account_id when includeUnassigned). */
  accountId?: string | null;
  /** Include income/expenses with no account_id. Default true for overall balance. */
  includeUnassigned?: boolean;
};

function matchesAccount(
  rowAccountId: string | null | undefined,
  filter?: AccountFilter
): boolean {
  if (!filter?.accountId) return true;
  if (rowAccountId === filter.accountId) return true;
  if (filter.includeUnassigned !== false && (rowAccountId == null || rowAccountId === "")) {
    return true;
  }
  return false;
}

/**
 * Book balance =
 *   sum(received income) − sum(actual expenses) + sum(adjustments)
 */
export function calcBalance(
  income: IncomeRow[],
  expenses: ExpenseRow[],
  adjustments: AdjustmentRow[] = [],
  filter?: AccountFilter
) {
  const totalIncome = income
    .filter((i) => i.received_at && matchesAccount(i.account_id, filter))
    .reduce((sum, i) => sum + toMad(i.amount, i.rate_to_mad), 0);

  const totalExpenses = expenses
    .filter(
      (e) => e.status === "actual" && matchesAccount(e.account_id, filter)
    )
    .reduce((sum, e) => sum + toMad(e.amount, e.rate_to_mad), 0);

  const totalAdjustments = adjustments
    .filter((a) => matchesAccount(a.account_id, filter))
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  return roundMoney(totalIncome - totalExpenses + totalAdjustments);
}

/**
 * Given current book balance and the real balance you typed,
 * returns the signed adjustment to insert.
 */
export function calcReconcileDelta(
  bookBalance: number,
  realBalance: number
): number {
  return roundMoney(realBalance - bookBalance);
}
