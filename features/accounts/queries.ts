import { createClient } from "@/lib/supabase/server";
import type { Account, Adjustment } from "./types";

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAccounts", error.message);
    return [];
  }
  return (data ?? []) as Account[];
}

export async function getAccountByType(
  type: "bank" | "cash" | "savings"
): Promise<Account | null> {
  const accounts = await getAccounts();
  return accounts.find((a) => a.type === type) ?? null;
}

export async function getAdjustments(
  accountId?: string
): Promise<Adjustment[]> {
  const supabase = await createClient();
  let q = supabase
    .from("adjustments")
    .select("*")
    .order("adjusted_on", { ascending: false });

  if (accountId) {
    q = q.eq("account_id", accountId);
  }

  const { data, error } = await q;
  if (error) {
    console.error("getAdjustments", error.message);
    return [];
  }
  return (data ?? []) as Adjustment[];
}
