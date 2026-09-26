# Title details and personal notes

This milestone gives watched titles a dedicated Watchnotes page and adds one private personal note per user/title.

## Database setup

Run this migration after the ranking migration:

```text
supabase/migrations/202609260004_create_user_media_notes.sql
```

It creates `user_media_notes` with row-level security.

Notes are private to the authenticated user. A user can only create or update a note after they have at least one `watch_events` row for that title.

## Title detail page

Open a title from Watched or from a ranking:

```text
/title/:mediaId
```

The page shows:

- poster, title, year, overview and runtime
- current ranking position
- number of watches
- tracked viewing time
- last watched date
- full watch/rewatch history
- editable personal note

## API

```text
GET    /library/titles/:mediaId
PUT    /library/titles/:mediaId/note
DELETE /library/titles/:mediaId/note
```

The note is intentionally separate from future social comments and replies.
