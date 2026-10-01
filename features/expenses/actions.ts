"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAccountId } from "@/features/accounts/default-account";
import { roundMoney } from "@/lib/calc/money";

function revalidateExpenses() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/expenses");
  revalidatePath("/insights");
}

export async function createExpense(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const category_id = String(formData.get("category_id") || "") || null;
  const note = String(formData.get("note") || "").trim() || null;
  const account_id = String(formData.get("account_id") || "") || null;

  return createExpenseData({ amount, category_id, note, account_id });
}

export async function createExpenseData(input: {
  amount: number;
  category_id?: string | null;
  note?: string | null;
  account_id?: string | null;
}) {
  const supabase = await createClient();
  const {
    amount,
    category_id = null,
    note = null,
    account_id: accountIdInput = null,
  } = input;

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const account_id = accountIdInput || (await getDefaultAccountId());

  const { error } = await supabase.from("expenses").insert({
    amount: roundMoney(amount),
    category_id,
    note,
    status: "actual",
    currency: "MAD",
    rate_to_mad: 1,
    account_id,
  });

  if (error) return { error: error.message };

  revalidateExpenses();
  return { success: true };
}
