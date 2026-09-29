export type RecurringItem = {
  id: string;
  kind: "income" | "expense";
  name: string;
  amount: number;
  currency: string;
  rate_to_mad: number;
  category_id: string | null;
  day_of_month: number;
  active: boolean;
  note: string | null;
  created_at: string;
  categories?: { name: string } | null;
};
