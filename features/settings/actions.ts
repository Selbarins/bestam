"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { roundMoney } from "@/lib/calc/money";

export async function upsertSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const safety_buffer = roundMoney(
    Math.max(0, Number(formData.get("safety_buffer") || 0))
  );
  let pay_cycle_days = Math.round(Number(formData.get("pay_cycle_days") || 28));
  if (!Number.isFinite(pay_cycle_days)) pay_cycle_days = 28;
  pay_cycle_days = Math.min(45, Math.max(14, pay_cycle_days));

  const { error } = await supabase.from("settings").upsert({
    user_id: user.id,
    safety_buffer,
    pay_cycle_days,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}
