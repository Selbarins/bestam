-- App settings (one row per user)
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- minimum cash to keep; Safe-to-Spend subtracts this
  safety_buffer numeric(12,2) not null default 0 check (safety_buffer >= 0),
  -- days after last received salary that define the pay cycle (default 28)
  pay_cycle_days int not null default 28 check (pay_cycle_days between 14 and 45),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Track each occurrence of a recurring item (paid or skipped)
create table public.recurring_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recurring_item_id uuid not null references public.recurring_items(id) on delete cascade,
  -- first day of the month this occurrence belongs to (YYYY-MM-01)
  period_month date not null,
  status text not null check (status in ('paid', 'skipped')),
  -- optional link when "paid" creates a real expense/income row
  linked_expense_id uuid references public.expenses(id) on delete set null,
  linked_income_id uuid references public.income(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (recurring_item_id, period_month)
);

create index recurring_occurrences_user_idx
  on public.recurring_occurrences (user_id, period_month);

alter table public.recurring_occurrences enable row level security;

create policy "own recurring_occurrences" on public.recurring_occurrences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
