import { createClient } from "@/lib/supabase/server";

export async function getCartItems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, name, estimated_amount, currency, rate_to_mad, category_id, note, created_at, categories(name)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCartPlannedTotal() {
  const items = await getCartItems();
  return items.reduce((sum, item) => {
    const amount = Number(item.estimated_amount);
    const rate = Number(item.rate_to_mad ?? 1);
    return sum + amount * rate;
  }, 0);
}
