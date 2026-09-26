create table if not exists public.media_titles (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  release_year integer,
  poster_url text,
  overview text,
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tmdb_id, media_type)
);

create table if not exists public.watchlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media_titles(id) on delete cascade,
  source_user_id uuid references public.profiles(id) on delete set null,
  source_type text check (
    source_type is null or source_type in ('profile', 'feed', 'taste_match', 'recommendation')
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

create table if not exists public.watch_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media_titles(id) on delete cascade,
  watched_at timestamptz not null default now(),
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  is_rewatch boolean not null default false
);

create index if not exists watch_events_user_watched_at_idx
on public.watch_events (user_id, watched_at desc);

create index if not exists watch_events_user_media_idx
on public.watch_events (user_id, media_id);

alter table public.media_titles enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.watch_events enable row level security;

create policy "media titles are publicly readable"
on public.media_titles
for select
using (true);

create policy "authenticated users can insert media titles"
on public.media_titles
for insert
to authenticated
with check (true);

create policy "authenticated users can update media titles"
on public.media_titles
for update
to authenticated
using (true)
with check (true);

create policy "users can read their watchlist"
on public.watchlist_items
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can add to their watchlist"
on public.watchlist_items
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their watchlist"
on public.watchlist_items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can remove from their watchlist"
on public.watchlist_items
for delete
to authenticated
using (auth.uid() = user_id);

create policy "users can read their watch events"
on public.watch_events
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their watch events"
on public.watch_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete their watch events"
on public.watch_events
for delete
to authenticated
using (auth.uid() = user_id);

grant select on public.media_titles to anon, authenticated;
grant insert, update on public.media_titles to authenticated;
grant select, insert, update, delete on public.watchlist_items to authenticated;
grant select, insert, delete on public.watch_events to authenticated;
