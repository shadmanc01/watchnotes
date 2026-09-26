# Supabase setup

Watchnotes uses Supabase for authentication and PostgreSQL storage. The browser does not receive database credentials; authentication requests go through the Watchnotes API and session tokens are stored in HTTP-only cookies.

## 1. Create a Supabase project

Create a project in Supabase and wait for the database to finish provisioning.

## 2. Copy project API values

In the Supabase project settings, copy:

- Project URL
- anon/public key

Add them to `apps/api/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Do not commit `apps/api/.env`.

## 3. Create the profile schema

Open the Supabase SQL Editor and run:

```text
supabase/migrations/202609260001_create_profiles.sql
```

The migration creates:

- `public.profiles`
- public profile read policy
- owner-only profile update policy
- automatic profile creation when a Supabase Auth user signs up

## 4. Configure authentication

Email/password authentication is supported.

For faster local development you may temporarily disable email confirmation in the Supabase Auth provider settings. If confirmation remains enabled, Watchnotes will tell a new user to confirm their email before signing in.

## 5. Restart Watchnotes

After changing `apps/api/.env`:

```bash
pnpm dev
```

Then visit:

- http://localhost:3000/signup
- http://localhost:3000/login
- http://localhost:3000/account

## Security model

- Supabase service-role credentials are not required for this milestone.
- Auth tokens live in HTTP-only cookies.
- Database row-level security remains enabled.
- The backend uses the anon key for authentication and public profile reads.
