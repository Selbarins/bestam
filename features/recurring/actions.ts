"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateRecurring() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/recurring");
  revalidatePath("/settings");
}

export async function createRecurring(formData: FormData) {
  const supabase = await createClient();

  const kind = String(formData.get("kind") || "expense") as "income" | "expense";
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount"));
  const day_of_month = Math.min(
    28,
    Math.max(1, Number(formData.get("day_of_month") || 1))
  );
  const category_id = String(formData.get("category_id") || "") || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (kind !== "income" && kind !== "expense") {
    return { error: "Invalid kind" };
  }
  if (!name) return { error: "Name is required" };
  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.from("recurring_items").insert({
    kind,
    name,
    amount,
    day_of_month,
    category_id: kind === "expense" ? category_id : null,
    note,
    currency: "MAD",
    rate_to_mad: 1,
    active: true,
  });

  if (error) return { error: error.message };

  revalidateRecurring();
  return { success: true };
}

export async function toggleRecurring(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_items")
    .update({ active })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateRecurring();
  return { success: true };
}

export async function deleteRecurring(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_items")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateRecurring();
  return { success: true };
}
