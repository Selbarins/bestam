-- Shopping cart: planned buys. Marking bought creates an expense and removes the item.
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  estimated_amount numeric(12,2) not null check (estimated_amount > 0),
  currency text not null default 'MAD',
  rate_to_mad numeric(12,6) not null default 1,
  category_id uuid references public.categories(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index cart_items_user_idx on public.cart_items (user_id, created_at desc);

alter table public.cart_items enable row level security;

create policy "own cart_items" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
