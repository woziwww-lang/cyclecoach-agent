# CycleCoach Agent MVP

Local-first MVP vertical slice:

```text
Strava OAuth -> sync latest 30 cycling activities -> dashboard selects ride -> fetch detail/streams -> map route -> local Ollama analysis -> structured coach result
```

## Requirements

- Node.js 22 LTS
- pnpm 9.x
- Ollama
- Strava API app

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env
```

Create a Strava API app and set the callback URL to:

```text
http://localhost:3000/api/auth/strava/callback
```

Fill `.env`:

```bash
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
```

Start Ollama. This only starts the Ollama server; it does not choose a model:

```bash
pnpm ollama:up
```

Pull the model configured for the app. The script reads `OLLAMA_MODEL` from `.env`; default is `qwen2.5:7b`:

```bash
pnpm ollama:pull
```

Lower-spec fallback models:

```bash
OLLAMA_MODEL=qwen2.5:3b pnpm ollama:pull
OLLAMA_MODEL=qwen2.5:0.5b pnpm ollama:pull
```

Recommended model choice:

- `qwen2.5:7b`: better coaching language, slower on many laptops.
- `qwen2.5:3b`: recommended daily local MVP model; much faster, still usable.
- `qwen2.5:0.5b`: emergency fallback for very low-spec machines; expect weaker language.

Then set `OLLAMA_MODEL` in `.env` or update it from `My Page`.

Verify which model the app will use:

```bash
pnpm ollama:list     # shows every model installed in the Docker volume
pnpm ollama:smoke    # reads .env, calls the configured model, and prints its response
```

Initialize the database:

```bash
pnpm db:push
pnpm db:seed
```

Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000`, create a local account, connect Strava, open `Ride Dashboard`, sync activities, select a ride, and click `Ask AI`.

Seeded local demo account:

```text
email: demo@cyclecoach.local
password: password123
```

Useful local commands:

```bash
pnpm local:setup     # db push + seed + start Ollama + pull configured model
pnpm ollama:up       # start Ollama Docker service; no model is selected here
pnpm ollama:pull     # pull the model configured by .env OLLAMA_MODEL
pnpm ollama:list     # list installed models in the Ollama Docker volume
pnpm ollama:smoke    # verify the app-configured model can generate text
pnpm ollama:logs     # follow Ollama container logs
pnpm app:health      # with pnpm dev running, check /api/health and /api/llm/health
pnpm dev:local       # start Ollama service, then Next dev server
pnpm dev:turbo       # run Next dev with Turbopack
pnpm verify          # typecheck + tests + production build
```

Quality and test tooling:

```bash
pnpm format          # Biome formatter, writes changes
pnpm format:check    # Biome formatter check only
pnpm lint            # Biome lint only
pnpm typecheck       # TypeScript check
pnpm test            # Vitest unit/component tests
pnpm test:e2e        # Playwright E2E and accessibility smoke tests
pnpm quality:unused  # Knip unused files/dependencies/exports audit
```

Before running Playwright for the first time on a fresh machine:

```bash
pnpm playwright:install
```

Tooling intentionally not initialized yet:

- `shadcn init`: skipped because the app already has lightweight UI primitives and this command would rewrite design-system assumptions.
- Storybook: skipped until component APIs stabilize.
- Sentry wizard: skipped until there is a deployed environment and DSN/project choice.

End-to-end local validation:

```bash
pnpm local:setup
pnpm ollama:smoke
pnpm dev
# in another terminal after the app starts
pnpm app:health
```

## Information architecture

- `/` Home: status-aware entry points.
- `/coach` AI Coach Chat: general sports chat, optionally with activity context.
- `/dashboard` Training data center: activity list, selected ride detail, route map, and AI analysis.
- `/planner` Plan Next Ride: quick next-workout planning with rule-based logic and optional local Ollama coach summary.
- `/me` My Page: Strava, language, local LLM model, and privacy settings.
- `/activities` redirects to `/dashboard` to avoid duplicate product paths.

## Login and Strava connection

CycleCoach now uses local email/password login first. Strava OAuth is an account connection, not the login system.

```text
Register/login -> Connect Strava -> Sync latest cycling activities -> Analyze ride
```

The OAuth scope requests `read,activity:read_all` so private activities and route streams can be available when Strava allows them. Tokens are kept server-side and are not exposed to the browser.

## Map troubleshooting

The app uses Strava route data in this order:

```text
streams.latlng -> map.summary_polyline -> no route data state
```

If Dashboard shows `No route data`, the selected activity does not have usable route points in local cache. Try:

1. choose an outdoor ride, not an indoor ride
2. reconnect Strava so the token has `activity:read_all`
3. click `Refresh detail & streams`

If Dashboard shows `Map failed to load`, the selected activity already has route points and the problem is Leaflet rendering, not Strava data. The error message will include the exact Leaflet initialization reason.

## i18n

MVP uses a lightweight local dictionary in `lib/i18n` instead of a heavier i18n framework. The active language comes from `UserSettings.language` after login, with browser language fallback for anonymous users.

Supported locale keys:

```text
en, zh, ja
```

Current coverage starts with global navigation and Home. The same dictionary pattern should be extended page by page before introducing a full framework like `next-intl`.

## UI/UX structure

See [`docs/ui-ux.md`](docs/ui-ux.md) for page responsibilities, final Home cards, visual tokens, and UX state rules.

## State management

- UI state: Zustand stores in `lib/stores`.
- API/server state: TanStack Query hooks in `lib/api`.
- Settings forms: React Hook Form + Zod.
- Dashboard state: the latest synced ride is selected by default; users switch rides inside the dashboard.
- AI state: loading skeletons and rule-based fallback if Ollama is offline or returns invalid JSON.

## SQLite now, PostGIS later

MVP intentionally stays on SQLite because the product is validating one local workflow: Strava activity sync, polyline/stream route display, deterministic metrics, and local AI explanation. Current route data is stored as `summaryPolyline` and Strava stream JSON; no spatial search is required.

Move to PostgreSQL + PostGIS when the product needs:

- nearby route search
- generated route indexing
- spatial risk zones
- route overlap queries
- multi-user production deployment

Future migration path:

```text
SQLite string JSON -> PostgreSQL jsonb
summaryPolyline / streams.latlng -> PostGIS LineString geometry
simple selected-ride map -> spatial route query and risk overlays
local-only app -> managed Postgres, encrypted tokens, multi-user auth
```

Draft future route table fields:

```text
routes(id, user_id, name, distance_m, elevation_m, source_activity_id, geometry LineString, raw jsonb)
route_points(route_id, idx, point geometry(Point), distance_m, altitude_m)
risk_zones(id, type, severity, geometry Polygon, source, updated_at)
```

## Notes

- Tokens are stored server-side only. For this local MVP they are stored in SQLite. Production must encrypt refresh tokens.
- Ollama is the default LLM path. Activity data is not sent to a third-party LLM.
- Default local model is `qwen2.5:7b`. If it is too slow, switch to `qwen2.5:3b` or `qwen2.5:0.5b`.
- If heart rate, power, cadence, route, or stream data is missing, the analysis lowers confidence and shows missing-data warnings.
- Coach output is not medical advice.
