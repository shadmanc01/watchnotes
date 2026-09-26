create table if not exists public.user_media_notes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media_titles(id) on delete cascade,
  body text not null
    check (
      char_length(body) <= 2000
      and char_length(btrim(body)) > 0
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

alter table public.user_media_notes enable row level security;

create policy "users can read their media notes"
on public.user_media_notes
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their media notes"
on public.user_media_notes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.watch_events
    where watch_events.user_id = auth.uid()
      and watch_events.media_id = user_media_notes.media_id
  )
);

create policy "users can update their media notes"
on public.user_media_notes
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.watch_events
    where watch_events.user_id = auth.uid()
      and watch_events.media_id = user_media_notes.media_id
  )
);

create policy "users can delete their media notes"
on public.user_media_notes
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete
on public.user_media_notes
to authenticated;
