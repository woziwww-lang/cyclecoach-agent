# UI/UX Structure

## Page Responsibilities

| Page | Route | Primary Goal | Main Components | Must Not Include |
| --- | --- | --- | --- | --- |
| Home | `/` | Explain CycleCoach, show local status, and route users into one of four tasks. | Status summary, four action cards. | Activity lists, analysis reports, duplicate CTAs. |
| Coach | `/coach` | General sports chat with optional ride context. | Context picker, prompt starters, chat thread, typing state. | Full ride dashboard or map workspace. |
| Dashboard | `/dashboard` | Main ride workspace. | 30-day summary, activity list, selected ride detail, map, analysis panel. | Product intro cards, settings forms. |
| Activity Detail | `/activities/[id]` | Deep review for one ride. | Metrics, map, streams, coach analysis. | Global onboarding or duplicate dashboard cards. |
| My Page | `/me` | Account, Strava, language, LLM, and privacy settings. | Settings cards. | Ride analysis or chat reports. |

## Final Home Cards

- `Let’s Talk` -> `/coach`
- `Ride Dashboard` -> `/dashboard`
- `Plan Next Ride` -> `/planner`: create a rule-based next-workout plan with optional local AI coach summary.
- `My Page` -> `/me` when logged in, `/register` when anonymous

The Home hero intentionally has no extra duplicate CTA buttons. The action cards are the only task entry points.

## Visual Tokens

- Page: soft neutral background.
- Surface: white with subtle slate border.
- Primary: Strava-inspired orange `#FC4C02`, used sparingly for primary action and emphasis.
- Text: `ink` for primary, `muted` for secondary.
- Card: `cc-card` for grouped content, `cc-card-muted` for page headers.
- Radius: mostly `1.25rem`; avoid heavy nested cards.
- Motion: small hover lift, active press, skeleton pulse.

## State Matrix

| Page/Component | Loading | Empty | Error | Success | Auth Required |
| --- | --- | --- | --- | --- | --- |
| Home | Server-rendered status. | Shows no cached ride in status panel. | Ollama warning inline. | Status pills. | Register card route. |
| Dashboard | Summary/list/detail skeletons. | Strava connect or sync CTA. | Retryable error state. | Synced activity list. | Strava connect state. |
| Activity Detail | Server not-found or dashboard return. | No route data callout. | Refresh/analyze errors inline. | Metrics/map/analysis. | Redirects to Home. |
| Coach | Chat skeleton while generating. | Prompt starter cards. | Assistant fallback message. | Assistant reply appended. | General chat works anonymous. |
| My Page | Query-driven cards. | Disconnected Strava card. | LLM warning and validation. | Inline saved message. | Login/create account panel. |

## Responsive Rules

- Mobile: one column, bottom nav, tappable cards.
- Tablet: summary cards in two columns.
- Desktop: Dashboard uses `360px + flexible detail`; activity list can be sticky.

## AI Output

AI ride analysis is structured, not raw Markdown:

- Overall verdict
- Effort type
- Key metrics
- Training meaning
- What went well
- What to improve
- Next ride
- Recovery
- Confidence and missing data

Generation uses a staged skeleton so slow local models do not look frozen.
