create table if not exists public.follows (
  follower_user_id uuid not null references public.profiles(id) on delete cascade,
  following_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_user_id, following_user_id),
  check (follower_user_id <> following_user_id)
);

create index if not exists follows_following_user_idx
on public.follows (following_user_id, created_at desc);

alter table public.follows enable row level security;

create policy "follows are publicly readable"
on public.follows
for select
to anon, authenticated
using (true);

create policy "users can follow profiles"
on public.follows
for insert
to authenticated
with check (
  auth.uid() = follower_user_id
  and follower_user_id <> following_user_id
);

create policy "users can unfollow profiles"
on public.follows
for delete
to authenticated
using (auth.uid() = follower_user_id);

grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;

create policy "ranking entries are publicly readable"
on public.ranking_entries
for select
to anon, authenticated
using (true);

grant select on public.ranking_entries to anon;
