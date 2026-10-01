export type AccountType = "bank" | "cash" | "savings";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  include_in_safe_to_spend: boolean;
  sort_order: number;
  created_at: string;
};

export type Adjustment = {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  note: string | null;
  adjusted_on: string;
  created_at: string;
};
