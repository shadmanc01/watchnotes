create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format
    check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$')
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
on public.profiles
for select
using (true);

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  requested_display_name text;
begin
  requested_username := lower(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      'user_' || substring(replace(new.id::text, '-', '') from 1 for 12)
    )
  );

  requested_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    requested_username
  );

  insert into public.profiles (id, username, display_name)
  values (new.id, requested_username, requested_display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
