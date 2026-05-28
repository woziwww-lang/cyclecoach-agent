# CycleCoach Agent MVP

First vertical slice:

```text
Strava OAuth -> sync latest 30 cycling activities -> select activity -> fetch detail/streams -> local Ollama analysis -> display result
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

Start Ollama:

```bash
ollama serve
ollama pull qwen2.5:7b
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

Open `http://localhost:3000`, connect Strava, sync activities, select a ride, and click `Ask AI to Analyze`.

## Notes

- Tokens are stored server-side only. For this local MVP they are stored in SQLite. Production must encrypt refresh tokens.
- Ollama is the default LLM path. Activity data is not sent to a third-party LLM.
- If heart rate, power, cadence, route, or stream data is missing, the analysis lowers confidence and shows missing-data warnings.
- Coach output is not medical advice.
