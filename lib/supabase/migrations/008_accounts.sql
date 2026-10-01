-- Accounts: Bank / Cash / Savings (solo app)
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('bank', 'cash', 'savings')),
  -- Savings is excluded from Safe-to-Spend by default
  include_in_safe_to_spend boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, type)
);

alter table public.accounts enable row level security;

create policy "own accounts" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed the three default accounts for every existing user (and future inserts via app)
-- Run once; safe if accounts already exist thanks to unique (user_id, type)
insert into public.accounts (user_id, name, type, include_in_safe_to_spend, sort_order)
select u.id, v.name, v.type, v.include_in_safe_to_spend, v.sort_order
from auth.users u
cross join (
  values
    ('Bank',   'bank',   true,  0),
    ('Cash',   'cash',   true,  1),
    ('Savings','savings', false, 2)
) as v(name, type, include_in_safe_to_spend, sort_order)
on conflict (user_id, type) do nothing;

-- Optional link from income / expenses to an account (nullable = legacy rows)
alter table public.income
  add column if not exists account_id uuid references public.accounts(id) on delete set null;

alter table public.expenses
  add column if not exists account_id uuid references public.accounts(id) on delete set null;

-- Adjustments: signed amount that forces the derived balance to match reality
-- positive = money appeared (or bank higher than books)
-- negative = money missing (or bank lower than books)
create table public.adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  amount numeric(12,2) not null, -- signed; not check (amount <> 0) so 0 is allowed but useless
  note text,
  adjusted_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index adjustments_account_idx on public.adjustments (user_id, account_id, adjusted_on desc);

alter table public.adjustments enable row level security;

create policy "own adjustments" on public.adjustments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
