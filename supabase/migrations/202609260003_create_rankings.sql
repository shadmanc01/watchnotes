create table if not exists public.ranking_entries (
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media_titles(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  position integer not null check (position > 0),
  ranked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

create index if not exists ranking_entries_user_type_position_idx
on public.ranking_entries (user_id, media_type, position);

create table if not exists public.ranking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  candidate_media_id uuid not null references public.media_titles(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  low_index integer not null default 0 check (low_index >= 0),
  high_index integer not null check (high_index >= 0),
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (high_index >= low_index)
);

create unique index if not exists ranking_sessions_one_active_type_idx
on public.ranking_sessions (user_id, media_type)
where status = 'active';

create table if not exists public.ranking_comparisons (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ranking_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  candidate_media_id uuid not null references public.media_titles(id) on delete cascade,
  opponent_media_id uuid not null references public.media_titles(id) on delete cascade,
  winner_media_id uuid not null references public.media_titles(id) on delete cascade,
  loser_media_id uuid not null references public.media_titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (winner_media_id <> loser_media_id)
);

create index if not exists ranking_comparisons_user_created_at_idx
on public.ranking_comparisons (user_id, created_at desc);

alter table public.ranking_entries enable row level security;
alter table public.ranking_sessions enable row level security;
alter table public.ranking_comparisons enable row level security;

create policy "users can read their ranking entries"
on public.ranking_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can add their ranking entries"
on public.ranking_entries
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their ranking entries"
on public.ranking_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete their ranking entries"
on public.ranking_entries
for delete
to authenticated
using (auth.uid() = user_id);

create policy "users can read their ranking sessions"
on public.ranking_sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their ranking sessions"
on public.ranking_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their ranking sessions"
on public.ranking_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can read their comparisons"
on public.ranking_comparisons
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their comparisons"
on public.ranking_comparisons
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.ranking_entries to authenticated;
grant select, insert, update on public.ranking_sessions to authenticated;
grant select, insert on public.ranking_comparisons to authenticated;

create or replace function public.finalize_ranking_session(
  p_session_id uuid,
  p_position integer
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.ranking_sessions%rowtype;
  v_existing_count bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_session
  from public.ranking_sessions
  where id = p_session_id
    and user_id = v_user_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Ranking session is not active.';
  end if;

  if not exists (
    select 1
    from public.watch_events
    where user_id = v_user_id
      and media_id = v_session.candidate_media_id
  ) then
    raise exception 'Only watched titles can be ranked.';
  end if;

  if exists (
    select 1
    from public.ranking_entries
    where user_id = v_user_id
      and media_id = v_session.candidate_media_id
  ) then
    update public.ranking_sessions
    set status = 'completed',
        updated_at = now()
    where id = p_session_id;

    return;
  end if;

  select count(*)
  into v_existing_count
  from public.ranking_entries
  where user_id = v_user_id
    and media_type = v_session.media_type;

  if p_position < 1 or p_position > v_existing_count + 1 then
    raise exception 'Invalid ranking position.';
  end if;

  update public.ranking_entries
  set position = position + 1,
      updated_at = now()
  where user_id = v_user_id
    and media_type = v_session.media_type
    and position >= p_position;

  insert into public.ranking_entries (
    user_id,
    media_id,
    media_type,
    position
  )
  values (
    v_user_id,
    v_session.candidate_media_id,
    v_session.media_type,
    p_position
  );

  update public.ranking_sessions
  set status = 'completed',
      low_index = p_position - 1,
      high_index = p_position - 1,
      updated_at = now()
  where id = p_session_id;
end;
$$;

grant execute on function public.finalize_ranking_session(uuid, integer)
to authenticated;
