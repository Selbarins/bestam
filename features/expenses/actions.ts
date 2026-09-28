"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();

  const amount = Number(formData.get("amount"));
  const category_id = String(formData.get("category_id") || "");
  const note = String(formData.get("note") || "").trim() || null;

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.from("expenses").insert({
    amount,
    category_id: category_id || null,
    note,
    status: "actual",
    currency: "MAD",
    rate_to_mad: 1,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/expenses");

  return { success: true };
}
