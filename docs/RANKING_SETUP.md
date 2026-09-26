# Head-to-head ranking setup

Watchnotes ranks movies and TV shows through relative preference instead of stars.

## Database setup

Run this migration in Supabase after the library migration:

```text
supabase/migrations/202609260003_create_rankings.sql
```

It creates:

- `ranking_entries` — the user's ordered movie/TV rankings
- `ranking_sessions` — resumable binary-insertion sessions
- `ranking_comparisons` — every head-to-head choice
- `finalize_ranking_session(...)` — an atomic database function that shifts positions and inserts the candidate

## Ranking behavior

Movie and TV rankings are separate.

A title must already be in the user's watched history before it can be ranked.

The first title becomes #1 automatically. Every later title is inserted with a binary-search-style process:

```text
candidate title
      ↓
compare against middle-ranked title
      ↓
preferred candidate? search upper half
preferred opponent?  search lower half
      ↓
repeat until one insertion position remains
```

This means a list of 100 titles generally requires about 7 comparisons instead of comparing the new title against all 100.

Sessions persist in the database, so refreshing the Rank page can resume an unfinished comparison flow.

## Routes

```text
GET  /rankings/:type
GET  /rankings/:type/unranked
GET  /rankings/:type/session
POST /rankings/:type/start
POST /rankings/:type/sessions/:sessionId/answer
```

`:type` is either `movie` or `tv`.

## UI

Visit:

```text
http://localhost:3000/rank
```

The page includes:

- separate Movies and TV Shows tabs
- the current ordered ranking
- watched titles that are ready to rank
- head-to-head comparison cards
