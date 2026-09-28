-- Income: salary and other sources. received_at stays empty until you press "Received".
create table public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MAD',
  rate_to_mad numeric(12,6) not null default 1,
  is_salary boolean not null default false,
  expected_on date not null default current_date,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.income enable row level security;

create policy "own income" on public.income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
