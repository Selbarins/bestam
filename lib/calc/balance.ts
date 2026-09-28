type IncomeRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  received_at: string | null;
};

type ExpenseRow = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: "planned" | "actual";
};

function toMad(amount: number | string, rate?: number | string | null) {
  return Number(amount) * Number(rate ?? 1);
}

/**
 * Simple current balance:
 * sum of received income − sum of actual expenses
 */
export function calcBalance(income: IncomeRow[], expenses: ExpenseRow[]) {
  const totalIncome = income
    .filter((i) => i.received_at)
    .reduce((sum, i) => sum + toMad(i.amount, i.rate_to_mad), 0);

  const totalExpenses = expenses
    .filter((e) => e.status === "actual")
    .reduce((sum, e) => sum + toMad(e.amount, e.rate_to_mad), 0);

  return totalIncome - totalExpenses;
}
