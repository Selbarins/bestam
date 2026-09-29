import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import { CartForm } from "@/features/cart/components/CartForm";
import { CartItemRow } from "@/features/cart/components/CartItemRow";

async function CartContent() {
  const supabase = await createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("cart_items")
      .select(
        "id, name, estimated_amount, note, created_at, categories(name)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, bucket")
      .order("sort_order"),
  ]);

  const list = items ?? [];
  const total = list.reduce(
    (s, i) => s + Number(i.estimated_amount),
    0
  );

  return (
    <div className="space-y-6">
      {list.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Planned total
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatMoney(total)}
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Reduces Safe-to-Spend
          </p>
        </div>
      )}

      <CartForm categories={categories ?? []} />

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cart is empty
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Add items you plan to buy
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => (
            <CartItemRow
              key={item.id}
              id={item.id}
              name={item.name}
              estimated_amount={Number(item.estimated_amount)}
              note={item.note}
              categoryName={
                (item.categories as { name?: string } | null)?.name ?? null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--muted))]"
        />
      ))}
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Planned buys
          </p>
        </div>
        <Link
          href="/money"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Back
        </Link>
      </div>

      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  );
}
