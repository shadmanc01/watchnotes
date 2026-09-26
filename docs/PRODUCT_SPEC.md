# Watchnotes product foundation

## Product idea

Watchnotes is a social movie and TV application centered on relative preference rather than star ratings.

Core loop:

```text
watch -> compare -> rank -> comment -> share -> discover -> watch again
```

## MVP capabilities

### Media tracking
- Search movies and TV through TMDB.
- The browser calls the Watchnotes API; TMDB credentials remain backend-only.
- Mark movies and TV as watched.
- Maintain separate movie and TV watchlists.
- Add a personal comment/note to watched media.
- Track rewatches without duplicating unique-title counts.

### Head-to-head ranking
- Rank watched movies against other watched movies.
- Rank watched shows against other watched shows.
- Use efficient comparisons to place newly watched titles into a user's ordered ranking.
- Persist individual winner/loser comparisons.

### Social
- Follow users.
- View friends' ranked lists.
- Bookmark a movie or show directly from another user's ranking.
- Preserve the source user when a bookmark came from a friend's ranking.
- Show social activity around watches, ranking changes, comments, and saves.
- Calculate taste-match percentages from overlapping ranked media.

### Viewing statistics
- Accumulate lifetime viewing minutes automatically.
- Display lifetime hours watched, such as "2,000 hours watched."
- Movies contribute their runtime.
- TV contributes runtime for consumed episodes.
- Rewatches add viewing time but do not increase unique-title totals.

### Leaderboards
Initial leaderboard categories:
- titles consumed
- hours watched
- influence (bookmarks generated from a user's rankings)
- notes/comments

Filters can later include friends/global, movies/TV/combined, and time windows.

### Viewer badges
Dynamic percentile badges:
- Top 10%
- Top 5%
- Top 1%

Only the highest qualifying badge should be displayed prominently.

## Implementation milestones

1. Project foundation
2. TMDB-backed movie and TV search
3. Authentication and profile persistence
4. Watched/watchlist tracking
5. Head-to-head ranking
6. Comments/notes
7. Social graph and feed
8. Lifetime viewing-time aggregation
9. Leaderboards and percentile badges
10. Taste match and recommendation features

## Later capabilities

- Movie/TV taste profile
- Movie twins / highly compatible users
- "What should we watch?" recommendations between friends
- Group watch recommendations
- Genre-specific badges
- Season-level TV rankings
- Personalized predicted preferences
- Year-in-review statistics
