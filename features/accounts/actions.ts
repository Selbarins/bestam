"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcBalance, calcReconcileDelta } from "@/lib/calc/balance";
import { roundMoney } from "@/lib/calc/money";

function revalidateMoney() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/settings");
}

/**
 * Reconcile: user types the real balance for an account.
 * We insert one signed adjustment so book balance becomes that number.
 */
export async function reconcileAccount(input: {
  accountId: string;
  realBalance: number;
  note?: string | null;
}) {
  const { accountId, realBalance, note = null } = input;

  if (!accountId) {
    return { error: "Account required" };
  }
  if (!Number.isFinite(realBalance)) {
    return { error: "Invalid balance" };
  }

  const supabase = await createClient();

  const [
    { data: income },
    { data: expenses },
    { data: adjustments },
  ] = await Promise.all([
    supabase
      .from("income")
      .select("amount, rate_to_mad, received_at, account_id"),
    supabase
      .from("expenses")
      .select("amount, rate_to_mad, status, account_id"),
    supabase.from("adjustments").select("amount, account_id"),
  ]);

  const book = calcBalance(
    income ?? [],
    expenses ?? [],
    adjustments ?? [],
    { accountId, includeUnassigned: true }
  );

  const delta = calcReconcileDelta(book, roundMoney(realBalance));

  if (delta === 0) {
    return { success: true, delta: 0, book, message: "Already matched" };
  }

  const { error } = await supabase.from("adjustments").insert({
    account_id: accountId,
    amount: delta,
    note: note?.trim() || "Reconcile",
    adjusted_on: new Date().toISOString().slice(0, 10),
  });

  if (error) {
    return { error: error.message };
  }

  revalidateMoney();
  return {
    success: true,
    delta,
    book,
    realBalance: roundMoney(realBalance),
  };
}
