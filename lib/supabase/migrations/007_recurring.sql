-- Recurring: income or expense that repeats monthly (or other interval)
create table public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MAD',
  rate_to_mad numeric(12,6) not null default 1,
  category_id uuid references public.categories(id) on delete set null,
  -- day of month 1–28 (safe for all months)
  day_of_month int not null default 1 check (day_of_month between 1 and 28),
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

create index recurring_items_user_idx on public.recurring_items (user_id, active);

alter table public.recurring_items enable row level security;

create policy "own recurring_items" on public.recurring_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
