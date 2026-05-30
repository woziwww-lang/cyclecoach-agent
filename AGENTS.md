# CycleCoach Agent Repository Rules

This file is the long-term working agreement for humans and AI agents editing this repository. Keep it practical. Update it when architecture or workflow decisions genuinely change.

## Product Direction

CycleCoach Agent is a local-first MVP for cycling coaching:

```text
local account -> connect Strava -> sync recent cycling activities -> inspect ride/map -> local Ollama analysis -> plan next ride
```

Do not expand the product sideways before this workflow stays reliable, fast, and pleasant.

## Package Manager And Runtime

- Use `pnpm`. Do not switch to npm, yarn, or bun.
- Target Node.js 22 LTS.
- Keep `packageManager` in `package.json` authoritative.
- Prefer `pnpm dev` for normal development.
- `pnpm dev:turbo` is allowed as an optional local speed path, but do not make Turbopack-only assumptions unless the default Next dev server also works.

## Core Commands

Use these commands before handing off meaningful changes:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Quality tools:

```bash
pnpm lint
pnpm format:check
pnpm quality:unused
```

E2E and accessibility:

```bash
pnpm playwright:install
pnpm test:e2e
```

Local LLM:

```bash
pnpm ollama:up
pnpm ollama:list
pnpm ollama:pull
pnpm ollama:smoke
```

Database:

```bash
pnpm db:push
pnpm db:seed
pnpm db:studio
```

## Current Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS plus local lightweight UI primitives
- UI state: Zustand
- Server/API state: TanStack Query
- Forms: React Hook Form + Zod when forms become non-trivial
- Database: Prisma + SQLite for MVP
- LLM: local Ollama first
- Maps: Leaflet + OpenStreetMap tiles
- Tests: Vitest, Testing Library, Playwright, axe
- Quality: Biome, Knip

Do not change the stack just to make the repo look more enterprise. Propose major changes first.

## Architecture Boundaries

`app/`

- Next.js route ownership only: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`.
- Pages should compose components and keep business logic thin.
- API routes should validate input, check auth, call services/helpers, and return responses.

`components/`

- Cross-feature UI, layout, feedback, maps, activity display, dashboard panels, coach UI.
- UI primitives belong in `components/ui`.
- Layout/navigation belongs in `components/layout`.
- Keep primitives business-agnostic.

`features/`

- Use for new feature-first modules.
- New substantial features should follow this shape:

```text
features/[feature]/
  components/
  api/
  schemas/
  services/
  types/
```

`lib/`

- Shared infrastructure and pure utilities.
- API client hooks may live in `lib/api` until a feature grows large enough to own them.
- Do not dump page-specific logic into `lib`.

`prisma/`

- Prisma schema, migrations if introduced, and seed data.
- SQLite is the MVP database. Do not introduce PostgreSQL/PostGIS until route search, spatial risk zones, production multi-user hosting, or cloud operations require it.

`tests/`

- Unit tests under domain folders such as `tests/fitness`.
- E2E tests under `tests/e2e`.
- Keep tests focused on important product flows, not snapshots of incidental UI.

## Feature Development Rules

For a new feature:

1. Define the user goal and route.
2. Put route composition in `app`.
3. Put feature UI/business code in `features/[feature]` if it is substantial.
4. Keep deterministic sport/fitness calculations in TypeScript, not the LLM.
5. Let the LLM explain or rewrite; do not let it invent metrics.
6. Add loading, empty, error, and fallback states.
7. Add focused tests for pure logic and at least one smoke path when the feature is user-facing.

## AI And Ollama Rules

- Default to local Ollama.
- Do not send Strava data to cloud LLMs by default.
- Keep prompts compact. Do not pass full streams unless absolutely required.
- Deterministic analysis comes first; LLM output is a presentation layer.
- Always support fallback if Ollama is offline, slow, missing the model, or returns invalid JSON.
- Never present coach output as medical advice.

## Strava And Data Privacy Rules

- OAuth tokens must stay server-side.
- Do not expose access or refresh tokens to client components.
- Strava data is only for the current user.
- Do not make public/private activity assumptions.
- Do not use user Strava data to train models.
- Keep local data deletion and disconnect flows working.
- Production must encrypt refresh tokens before launch.

## UI/UX Rules

- Keep the product bright, clean, athletic, and focused.
- No duplicate primary cards that route to the same task.
- Home has distinct product entry points only.
- Dashboard is the training data center.
- My Page owns Strava, language, model, and privacy settings.
- Use SVG/icon components, not random emoji/symbols, for core product navigation.
- Keep mobile first and avoid table-heavy mobile layouts.
- All AI generation flows need skeleton/loading state and fallback UI.

## Dependency Rules

- Prefer small, proven dependencies.
- Do not add UI frameworks, chart libraries, auth systems, ORMs, queue systems, or cloud SDKs without a concrete feature need.
- Before adding a dependency, check whether existing utilities/components are enough.
- Run `pnpm quality:unused` periodically, but treat its output as an audit, not an auto-delete instruction.

## Formatting And Linting

- Biome is the formatter/linter.
- Do not run broad formatting if the task is a tiny patch unless requested.
- `pnpm lint` currently reports lint warnings as allowed by Biome, but fix obvious accessibility issues when touching nearby code.
- TypeScript strictness stays on.

## Git Rules

- Do not commit secrets.
- `.env` must remain local.
- Keep generated caches and build output out of commits.
- Do not revert user changes unless explicitly asked.
- Prefer small, coherent commits.

## CI/CD Roadmap

MVP CI should stay simple:

```text
install -> lint -> typecheck -> test -> build
```

Next CI additions:

- Playwright E2E smoke tests on pull requests.
- Knip audit as non-blocking initially.
- Docker build verification once deployment packaging stabilizes.

Do not add complex release automation before deployment targets are real.

## AWS And Terraform Roadmap

Do not introduce AWS or Terraform into the MVP path yet.

When moving toward production, prefer this sequence:

1. Dockerize app runtime cleanly.
2. Move SQLite to PostgreSQL.
3. Add encrypted OAuth token storage.
4. Add managed secrets.
5. Add CI Docker build.
6. Add AWS infrastructure with Terraform.

Target AWS shape when ready:

```text
Route53 + ACM
CloudFront or ALB
ECS Fargate
RDS PostgreSQL
S3 if file storage becomes necessary
Secrets Manager
CloudWatch logs
Sentry/OpenTelemetry
```

Use Terraform only after the manual architecture is stable enough to encode.

## Things Not To Do Yet

- Do not migrate to a monorepo just for structure.
- Do not add Redis/BullMQ until background jobs are truly needed.
- Do not add S3 until uploads or durable file storage are required.
- Do not add PostGIS until spatial query features exist.
- Do not initialize Storybook until component APIs stabilize.
- Do not initialize Sentry wizard until there is a real project DSN and deployment target.
- Do not run `shadcn init` over the existing UI without a design-system migration plan.

## Handoff Expectations

When completing a task, report:

- What changed.
- What was intentionally not changed.
- Which commands passed.
- Any known warnings or follow-up risks.

