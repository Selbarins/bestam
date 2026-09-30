import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseExpenseText, matchCategory } from "@/lib/nl/parse-expense";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function POST(req: NextRequest) {
  const token = process.env.CAPTURE_TOKEN;
  const ownerId = process.env.OWNER_USER_ID;

  if (!token || !ownerId) {
    return NextResponse.json(
      { error: "Capture API not configured" },
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!bearer || !safeEqual(bearer, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  let amount = Number(body.amount);
  let note = body.note ? String(body.note) : null;
  let category_id = body.category_id ? String(body.category_id) : null;

  if (body.text) {
    const parsed = parseExpenseText(String(body.text));
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not parse text. Try "coffee 25"' },
        { status: 400 }
      );
    }
    amount = parsed.amount;
    note = parsed.note || note;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Keep money to 2 decimal places (MAD)
  amount = Math.round(amount * 100) / 100;

  const admin = createClient(url, serviceKey);

  if (!category_id && note) {
    const { data: cats } = await admin.from("categories").select("id, name");
    category_id = matchCategory(
      note.toLowerCase().split(/\s+/),
      cats ?? []
    );
  }

  const { error } = await admin.from("expenses").insert({
    user_id: ownerId,
    amount,
    note,
    category_id,
    status: "actual",
    currency: "MAD",
    rate_to_mad: 1,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, amount, note, category_id });
}
