-- Expenses: planned (future) or actual (already spent)
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MAD',
  rate_to_mad numeric(12,6) not null default 1,
  note text,
  status text not null default 'actual' check (status in ('planned','actual')),
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index expenses_spent_on_idx on public.expenses (user_id, spent_on desc);

alter table public.expenses enable row level security;

create policy "own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
