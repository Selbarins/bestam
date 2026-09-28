"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createIncome(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "Salary").trim();
  const amount = Number(formData.get("amount"));
  const markReceived = formData.get("mark_received") === "on";

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { error } = await supabase.from("income").insert({
    name,
    amount,
    currency: "MAD",
    rate_to_mad: 1,
    is_salary: name.toLowerCase().includes("salary"),
    expected_on: new Date().toISOString().slice(0, 10),
    received_at: markReceived ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/income");

  return { success: true };
}

export async function markIncomeReceived(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("income")
    .update({ received_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/money/income");

  return { success: true };
}
