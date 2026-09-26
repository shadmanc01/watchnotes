# Public profiles and social foundation

This milestone makes Watchnotes rankings social without exposing private notes or private watch history.

## Database setup

Run:

```text
supabase/migrations/202609260005_create_social_graph.sql
```

after the title notes migration.

It creates the `follows` table and makes `ranking_entries` publicly readable. Personal notes remain protected by their existing user-only RLS policy.

## Public profile

Profiles are available at:

```text
/u/:username
```

A public profile includes:

- display name, username, avatar and bio
- follower/following counts
- public movie ranking
- public TV ranking
- follow/unfollow
- save-to-watchlist actions for titles in another user's ranking

## Attribution

Saving a title from another user's ranking writes:

```text
watchlist_items.source_user_id = source profile
watchlist_items.source_type = 'profile'
```

This preserves the source for future UI such as:

```text
Added from @shadman's #7 ranking
```

The existing watchlist schema already had these attribution fields, so no watchlist migration is needed.

## Privacy boundary

This milestone intentionally exposes rankings, not:

- personal notes
- private watch history
- email addresses
- auth data

A private-profile setting can be added later if the product needs it.
