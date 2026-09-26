# Watched and watchlist setup

This milestone adds persisted movie/TV library data.

## Database setup

Run this migration in the Supabase SQL Editor after the profile migration:

```text
supabase/migrations/202609260002_create_library.sql
```

It creates:

- `media_titles` for normalized TMDB metadata
- `watchlist_items` for titles saved for later
- `watch_events` for each time a user marks a title watched

All three tables use row-level security.

## Behavior

### Add to watchlist

The backend fetches current TMDB details, stores/updates the normalized title, and creates the user's watchlist row.

### Mark watched

The backend:

1. fetches current TMDB details
2. stores/updates the normalized title
3. determines whether this is a rewatch
4. writes a watch event
5. removes the title from the user's watchlist if it was there

Movie watch events snapshot the movie runtime so lifetime viewing hours can be computed later.

For TV, whole-show watched status is supported now, but watch-event runtime is intentionally left untracked until episode-level tracking is added. This avoids pretending an estimated series runtime is exact.

## Routes

```text
GET  /library/watchlist
POST /library/watchlist
GET  /library/watched
POST /library/watched
```

All routes require an authenticated Watchnotes session.
