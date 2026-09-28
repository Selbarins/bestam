create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null check (type in ('savings','emergency','cap')),
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  target_date date,
  category_id uuid references public.categories(id) on delete set null,
  currency text not null default 'MAD',
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
