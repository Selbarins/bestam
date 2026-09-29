export type CartItem = {
  id: string;
  name: string;
  estimated_amount: number;
  currency: string;
  rate_to_mad: number;
  category_id: string | null;
  note: string | null;
  created_at: string;
  categories?: { name: string } | null;
};
