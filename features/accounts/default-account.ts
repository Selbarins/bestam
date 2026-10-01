import { createClient } from "@/lib/supabase/server";

/**
 * Returns the Bank account id for the current user, or null.
 * Used as the default when creating income / expenses.
 */
export async function getDefaultAccountId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("id")
    .eq("type", "bank")
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}
