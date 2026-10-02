"use server";

import { loadSafeToSpendV2 } from "./safe-to-spend-data";
import { calcSafeToSpendV2WithPurchase } from "@/lib/calc/safe-to-spend-v2";
import { roundMoney } from "@/lib/calc/money";
import { templateAffordCoach, polishAffordCoach } from "@/lib/calc/afford-coach";

export type AffordResult = {
  amount: number;
  label: string;
  date: string;
  beforeDaily: number;
  afterDaily: number;
  beforeLowest: number;
  afterLowest: number;
  beforeDiscretionary: number;
  afterDiscretionary: number;
  /** Comfortable | Tight | Breaches buffer | Overdrawn */
  status: "comfortable" | "tight" | "buffer" | "overdrawn";
  coach: string | null;
};

export async function previewPurchase(input: {
  amount: number;
  label?: string;
  date?: string; // YYYY-MM-DD, default today
}): Promise<{ error: string } | { success: true; result: AffordResult }> {
  const amount = roundMoney(Math.abs(Number(input.amount) || 0));
  if (amount <= 0) return { error: "Enter an amount greater than 0" };

  const data = await loadSafeToSpendV2();
  const today = new Date().toISOString().slice(0, 10);
  const date = (input.date || today).slice(0, 10);
  const label = (input.label || "Purchase").trim() || "Purchase";

  const before = data.safe;
  const after = calcSafeToSpendV2WithPurchase(
    {
      startBalance: data.startBalance,
      events: data.events,
      endDate: data.cycle.cycleEnd,
      safetyBuffer: data.settings.safety_buffer,
    },
    { amount, date, label }
  );

  let status: AffordResult["status"] = "comfortable";
  if (after.lowestBalance < 0) status = "overdrawn";
  else if (after.discretionary < 0) status = "buffer";
  else if (after.daily < before.daily * 0.7 || after.daily < 20)
    status = "tight";

    const result: AffordResult = {
    amount,
    label,
    date,
    beforeDaily: before.daily,
    afterDaily: after.daily,
    beforeLowest: before.lowestBalance,
    afterLowest: after.lowestBalance,
    beforeDiscretionary: before.discretionary,
    afterDiscretionary: after.discretionary,
    status,
    coach: templateAffordCoach({ status }),
  };

  // Optional AI rewrite (never blocks correctness)
  try {
    result.coach = await polishAffordCoach(result);
  } catch {
    // keep template coach
  }

  return { success: true, result };
  
  let coach: string | null = null;
  try {
    if (process.env.GROQ_API_KEY) {
      const { polishAffordCoach } = await import("@/lib/calc/afford-coach");
      coach = await polishAffordCoach(result);
    }
  } catch {
    coach = null;
  }

  return { success: true, result: { ...result, coach } };
}
