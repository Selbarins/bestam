import { createClient } from "@/lib/supabase/server";
import type { Settings } from "./types";

const DEFAULTS = {
  safety_buffer: 0,
  pay_cycle_days: 28,
};

export async function getSettings(): Promise<
  Pick<Settings, "safety_buffer" | "pay_cycle_days">
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULTS;

  const { data } = await supabase
    .from("settings")
    .select("safety_buffer, pay_cycle_days")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    safety_buffer: Number(data.safety_buffer) || 0,
    pay_cycle_days: Number(data.pay_cycle_days) || 28,
  };
}
