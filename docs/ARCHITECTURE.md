# Watchnotes architecture

## Goals

Watchnotes should remain easy to understand as it grows. Frontend pages stay thin, backend modules own business logic, and external services are isolated behind explicit integrations.

## Top-level boundaries

```text
apps/web        Browser UI and presentation
apps/api        HTTP API and business logic
packages/shared Shared domain contracts
packages/api-client Typed browser-to-API access
packages/config Shared tooling configuration
```

The frontend must not call TMDB or the database directly. The expected direction is:

```text
web -> api -> integrations -> external services/database
```

## Frontend organization

Use feature-first folders:

```text
src/
  app/                  Next.js routes only
  features/
    rankings/
      components/
      hooks/
      api/
      types/
      utils/
  components/
    ui/
    layout/
    common/
  lib/
  providers/
```

### Frontend rules

1. Route files should mostly compose a feature screen.
2. Components should have one clear responsibility.
3. Feature-specific components stay inside that feature.
4. Generic visual primitives go in `components/ui`.
5. Fetching and mutation logic should not be scattered through presentational components.
6. If a component grows difficult to scan, split behavior and presentation rather than allowing a large all-in-one file.
7. Ranking algorithms and domain calculations do not belong in React components.

## Backend organization

Each business domain gets a module:

```text
src/modules/
  rankings/
    ranking.routes.ts
    ranking.controller.ts
    ranking.service.ts
    ranking.repository.ts
    ranking.schema.ts
    ranking.types.ts
```

Not every module needs every file on day one. Add layers when the responsibility exists.

### Backend rules

- Routes define HTTP endpoints.
- Controllers translate HTTP input/output.
- Services own application and business rules.
- Repositories own persistence.
- Integration clients own communication with external providers.
- HTTP handlers do not contain ranking algorithms or raw database logic.
- Database/service secrets never reach the frontend.

## Planned integration boundaries

```text
src/integrations/
  tmdb/
    tmdb.client.ts
    tmdb.mapper.ts
    tmdb.types.ts
  supabase/
    supabase.client.ts
```

Our application should consume normalized Watchnotes models, not TMDB response shapes directly.

## Core domains

Initial domains are expected to include:

- auth
- users/profiles
- media
- watch history
- watchlist
- comparisons
- rankings
- comments/notes
- follows/social graph
- feed
- taste match
- leaderboards
- recommendations

## Data conventions

- Store viewing duration internally in minutes.
- Unique title counts and viewing time are separate metrics.
- Rewatches may increase viewing minutes without increasing unique-title counts.
- Movie and TV rankings remain separate.
- Head-to-head comparisons are persisted as first-class data.
- Watchlist saves should retain attribution when a title was bookmarked from another user's ranking.

## Testing strategy

Domain-heavy code such as ranking insertion, leaderboard percentiles, viewing-time aggregation, and taste matching should be unit tested independently from HTTP and React.

Integration tests should cover API/database boundaries once those modules are introduced.
