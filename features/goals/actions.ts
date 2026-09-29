"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateGoals() {
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient();

  const type = String(formData.get("type") || "savings") as
    | "savings"
    | "emergency"
    | "cap";
  const name = String(formData.get("name") || "").trim();
  const target_amount = Number(formData.get("target_amount"));
  const current_amount = Number(formData.get("current_amount") || 0);
  const target_date = String(formData.get("target_date") || "") || null;
  const category_id = String(formData.get("category_id") || "") || null;

  if (!["savings", "emergency", "cap"].includes(type)) {
    return { error: "Invalid type" };
  }
  if (!name) return { error: "Name is required" };
  if (!target_amount || target_amount <= 0) {
    return { error: "Target must be greater than 0" };
  }
  if (type === "cap" && !category_id) {
    return { error: "Category required for spending cap" };
  }

  const { error } = await supabase.from("goals").insert({
    type,
    name,
    target_amount,
    current_amount: type === "cap" ? 0 : Math.max(0, current_amount),
    target_date: type === "savings" ? target_date : null,
    category_id: type === "cap" ? category_id : null,
    currency: "MAD",
  });

  if (error) return { error: error.message };

  revalidateGoals();
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
    .select("current_amount, type")
    .eq("id", id)
    .single();

  if (fetchError || !goal) {
    return { error: fetchError?.message || "Goal not found" };
  }
  if (goal.type === "cap") {
    return { error: "Caps track spending automatically" };
  }

  const next = Number(goal.current_amount) + amount;
  const { error } = await supabase
    .from("goals")
    .update({ current_amount: next })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateGoals();
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateGoals();
  return { success: true };
}

/** Remaining savings/emergency target not yet funded — reduces Safe-to-Spend */
export async function getGoalReservesMad() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("type, target_amount, current_amount")
    .in("type", ["savings", "emergency"]);

  return (data ?? []).reduce((s, g) => {
    const left = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
    // only reserve a month's slice if savings has a long runway — simple: full remaining / 1 month max impact
    // pragmatic: reserve min(remaining, remaining) as monthly set-aside = remaining / max(1, months) 
    // v1: count full remaining so STS is conservative
    return s + left;
  }, 0);
}
