# Watchnotes

A social movie and TV tracking app built around head-to-head ranking, taste matching, friend discovery, watchlists, comments, and viewing statistics.

## Repository structure

```text
apps/
  web/        Next.js frontend
  api/        Fastify + TypeScript backend
packages/
  shared/     Shared domain types and schemas
  api-client/ Typed frontend-to-backend client
  config/     Shared TypeScript configuration
docs/
  ARCHITECTURE.md
  PRODUCT_SPEC.md
```

## Local development

Prerequisites:

- Node.js 20+
- pnpm

Install dependencies:

```bash
pnpm install
```

Create local environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Add your TMDB API Read Access Token to `apps/api/.env`.

Run the frontend and backend together:

```bash
pnpm dev
```

Default local URLs:

- Web: http://localhost:3000
- Discover/search: http://localhost:3000/discover
- API: http://localhost:4000
- API health check: http://localhost:4000/health

## Engineering principles

- Frontend and backend are separate applications.
- Route files stay thin.
- Features own their components, hooks, and client-side logic.
- Backend routes call controllers/services; business logic does not live in HTTP handlers.
- External providers such as TMDB and Supabase are isolated behind integration modules.
- Large components are split by responsibility instead of growing into monoliths.
- Shared contracts live in `packages/shared`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full conventions.
