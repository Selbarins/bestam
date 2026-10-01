import { createClient } from "@/lib/supabase/server";

export type ExpenseWithBucket = {
  amount: number | string;
  rate_to_mad?: number | string | null;
  status: string;
  spent_on?: string | null;
  bucket?: string | null;
};

/**
 * Actual expenses joined with category bucket for runway.
 */
export async function getExpensesWithBucket(): Promise<ExpenseWithBucket[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "amount, rate_to_mad, status, spent_on, categories(bucket)"
    )
    .eq("status", "actual");

  if (error || !data) {
    console.error("getExpensesWithBucket", error?.message);
    return [];
  }

  return data.map((row) => {
    const cat = row.categories as { bucket?: string } | { bucket?: string }[] | null;
    let bucket: string | null = null;
    if (Array.isArray(cat)) bucket = cat[0]?.bucket ?? null;
    else if (cat) bucket = cat.bucket ?? null;

    return {
      amount: row.amount,
      rate_to_mad: row.rate_to_mad,
      status: row.status,
      spent_on: row.spent_on,
      bucket,
    };
  });
}
