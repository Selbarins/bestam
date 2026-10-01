"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/money");
  revalidatePath("/money/expenses");
  revalidatePath("/money/income");
  revalidatePath("/insights");
}

/**
 * Deletes the most recent actual expense (by created_at).
 * One-tap undo after a mistaken capture.
 */
export async function undoLastExpense() {
  const supabase = await createClient();

  const { data: row, error: findError } = await supabase
    .from("expenses")
    .select("id, amount, note, created_at")
    .eq("status", "actual")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) return { error: findError.message };
  if (!row) return { error: "Nothing to undo" };

  const { error } = await supabase.from("expenses").delete().eq("id", row.id);
  if (error) return { error: error.message };

  revalidateAll();
  return {
    success: true,
    undone: { id: row.id, amount: row.amount, note: row.note },
  };
}

/**
 * Deletes the most recent adjustment (last reconcile).
 */
export async function undoLastAdjustment() {
  const supabase = await createClient();

  const { data: row, error: findError } = await supabase
    .from("adjustments")
    .select("id, amount, note, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) return { error: findError.message };
  if (!row) return { error: "Nothing to undo" };

  const { error } = await supabase
    .from("adjustments")
    .delete()
    .eq("id", row.id);
  if (error) return { error: error.message };

  revalidateAll();
  return {
    success: true,
    undone: { id: row.id, amount: row.amount, note: row.note },
  };
}
