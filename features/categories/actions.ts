"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKETS = new Set(["essentials", "lifestyle", "growth", "other"]);

function revalidateCategories() {
  revalidatePath("/settings");
  revalidatePath("/money/expenses");
  revalidatePath("/money/cart");
  revalidatePath("/money/recurring");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const bucket = String(formData.get("bucket") || "other");

  if (!name) return { error: "Name is required" };
  if (!BUCKETS.has(bucket)) return { error: "Invalid bucket" };

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("categories").insert({
    name,
    bucket,
    icon: "circle",
    color:
      bucket === "essentials"
        ? "#38bdf8"
        : bucket === "lifestyle"
          ? "#a78bfa"
          : bucket === "growth"
            ? "#34d399"
            : "#fbbf24",
    sort_order,
  });

  if (error) return { error: error.message };

  revalidateCategories();
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const bucket = String(formData.get("bucket") || "other");

  if (!name) return { error: "Name is required" };
  if (!BUCKETS.has(bucket)) return { error: "Invalid bucket" };

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      bucket,
      color:
        bucket === "essentials"
          ? "#38bdf8"
          : bucket === "lifestyle"
            ? "#a78bfa"
            : bucket === "growth"
              ? "#34d399"
              : "#fbbf24",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateCategories();
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  // expenses.category_id is ON DELETE SET NULL — safe
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateCategories();
  return { success: true };
}
