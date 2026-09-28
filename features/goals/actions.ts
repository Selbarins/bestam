"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const target_amount = Number(formData.get("target_amount"));
  const current_amount = Number(formData.get("current_amount") || 0);
  const target_date = String(formData.get("target_date") || "") || null;

  if (!name) return { error: "Name is required" };
  if (!target_amount || target_amount <= 0) {
    return { error: "Target must be greater than 0" };
  }

  const { error } = await supabase.from("goals").insert({
    type: "savings",
    name,
    target_amount,
    current_amount: Math.max(0, current_amount),
    target_date,
    currency: "MAD",
  });

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function contributeToGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", id)
    .single();

  if (fetchError || !goal) {
    return { error: fetchError?.message || "Goal not found" };
  }

  const next = Number(goal.current_amount) + amount;

  const { error } = await supabase
    .from("goals")
    .update({ current_amount: next })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}
