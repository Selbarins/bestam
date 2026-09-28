"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/money");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/money");
  return { success: true };
}

export async function updateExpense(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") || "").trim() || null;
  const category_id = String(formData.get("category_id") || "") || null;

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ amount, note, category_id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/money");
  return { success: true };
}

export async function updateIncome(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const amount = Number(formData.get("amount"));
  const name = String(formData.get("name") || "Salary").trim();
  const markReceived = formData.get("mark_received") === "on";

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase
    .from("income")
    .update({
      amount,
      name,
      received_at: markReceived ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/money");
  return { success: true };
}
