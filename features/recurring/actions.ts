"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAccountId } from "@/features/accounts/default-account";
import { periodMonthKey } from "@/lib/calc/pay-cycle";
import { roundMoney } from "@/lib/calc/money";

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

export async function markRecurringPaid(id: string) {
  const supabase = await createClient();
  const period = periodMonthKey();

  const { data: item, error: findError } = await supabase
    .from("recurring_items")
    .select("id, kind, name, amount, category_id")
    .eq("id", id)
    .single();

  if (findError || !item) {
    return { error: findError?.message || "Not found" };
  }

  const account_id = await getDefaultAccountId();
  let linked_expense_id: string | null = null;
  let linked_income_id: string | null = null;

  if (item.kind === "expense") {
    const { data: exp, error } = await supabase
      .from("expenses")
      .insert({
        amount: roundMoney(Number(item.amount)),
        category_id: item.category_id,
        note: item.name,
        status: "actual",
        currency: "MAD",
        rate_to_mad: 1,
        account_id,
        spent_on: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    linked_expense_id = exp.id;
  } else {
    const { data: inc, error } = await supabase
      .from("income")
      .insert({
        name: item.name,
        amount: roundMoney(Number(item.amount)),
        currency: "MAD",
        rate_to_mad: 1,
        is_salary: item.name.toLowerCase().includes("salary"),
        expected_on: new Date().toISOString().slice(0, 10),
        received_at: new Date().toISOString(),
        account_id,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    linked_income_id = inc.id;
  }

  const { error } = await supabase.from("recurring_occurrences").upsert(
    {
      recurring_item_id: id,
      period_month: period,
      status: "paid",
      linked_expense_id,
      linked_income_id,
    },
    { onConflict: "recurring_item_id,period_month" }
  );

  if (error) return { error: error.message };

  revalidateRecurring();
  revalidatePath("/money/expenses");
  revalidatePath("/money/income");
  return { success: true };
}

export async function markRecurringSkipped(id: string) {
  const supabase = await createClient();
  const period = periodMonthKey();

  const { error } = await supabase.from("recurring_occurrences").upsert(
    {
      recurring_item_id: id,
      period_month: period,
      status: "skipped",
      linked_expense_id: null,
      linked_income_id: null,
    },
    { onConflict: "recurring_item_id,period_month" }
  );

  if (error) return { error: error.message };

  revalidateRecurring();
  return { success: true };
}
