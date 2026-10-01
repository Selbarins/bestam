"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAccountId } from "@/features/accounts/default-account";
import { roundMoney } from "@/lib/calc/money";

function revalidateIncome() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/income");
}

export async function createIncome(formData: FormData) {
  const name = String(formData.get("name") || "Salary").trim();
  const amount = Number(formData.get("amount"));
  const markReceived = formData.get("mark_received") === "on";
  const accountIdFromForm = String(formData.get("account_id") || "") || null;

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const supabase = await createClient();
  const account_id = accountIdFromForm || (await getDefaultAccountId());

  const { error } = await supabase.from("income").insert({
    name,
    amount: roundMoney(amount),
    currency: "MAD",
    rate_to_mad: 1,
    is_salary: name.toLowerCase().includes("salary"),
    expected_on: new Date().toISOString().slice(0, 10),
    received_at: markReceived ? new Date().toISOString() : null,
    account_id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateIncome();
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

  revalidateIncome();
  return { success: true };
}
