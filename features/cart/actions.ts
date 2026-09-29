"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateCart() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/cart");
}

export async function addCartItem(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const estimated_amount = Number(formData.get("estimated_amount"));
  const category_id = String(formData.get("category_id") || "") || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (!name) return { error: "Name is required" };
  if (!estimated_amount || estimated_amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.from("cart_items").insert({
    name,
    estimated_amount,
    category_id,
    note,
    currency: "MAD",
    rate_to_mad: 1,
  });

  if (error) return { error: error.message };

  revalidateCart();
  return { success: true };
}

export async function deleteCartItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cart_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateCart();
  return { success: true };
}

/** Mark bought → create actual expense, then remove cart item */
export async function markCartItemBought(id: string) {
  const supabase = await createClient();

  const { data: item, error: fetchError } = await supabase
    .from("cart_items")
    .select("name, estimated_amount, category_id, note, currency, rate_to_mad")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    return { error: fetchError?.message || "Item not found" };
  }

  const { error: expenseError } = await supabase.from("expenses").insert({
    amount: item.estimated_amount,
    category_id: item.category_id,
    note: item.note || item.name,
    status: "actual",
    currency: item.currency || "MAD",
    rate_to_mad: item.rate_to_mad ?? 1,
    spent_on: new Date().toISOString().slice(0, 10),
  });

  if (expenseError) return { error: expenseError.message };

  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  revalidateCart();
  revalidatePath("/money/expenses");
  return { success: true };
}
