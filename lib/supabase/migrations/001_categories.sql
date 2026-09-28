-- Categories: grouped into 4 buckets so charts stay clean
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  bucket text not null check (bucket in ('essentials','lifestyle','growth','other')),
  icon text not null default 'circle',
  color text not null default '#22d3ee',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
