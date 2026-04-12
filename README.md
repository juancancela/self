# Self - Health Dashboard

Personal health dashboard for weight loss tracking with adaptive forecasting, diet planning, exercise logging, and gamified achievements.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 4
- Recharts (charts)
- date-fns (date utilities)
- Vercel (deployment)

## Data files

All personal data lives in `src/data/`:

- **`config.json`** — Profile (height, age, weight target), plan mode, diet restrictions
- **`weight-log.json`** — Daily weight entries: `{ date, weight_kg, notes }`
- **`exercise-log.json`** — Daily exercise + diet adherence

### Daily workflow

1. Edit `weight-log.json` with today's morning weight
2. Edit `exercise-log.json` with today's activities
3. Commit and push — Vercel auto-redeploys

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Connected to Vercel for auto-deploy on push to `main`. A GitHub Actions cron job triggers daily redeployment at 03:00 ART.

To set up the daily cron: add a `VERCEL_DEPLOY_HOOK` secret in GitHub repo settings with your Vercel deploy hook URL.
