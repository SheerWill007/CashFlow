# Cashflow

Personal expense tracker with accounts, a daily spending allowance, and a breakdown of where the money goes.

```
cashflow/
├── backend/    NestJS API + SQLite (node:sqlite), TypeScript
├── frontend/   Nuxt 4 (Vue 3) app, TypeScript, with Lenis smooth scroll and a light/dark theme
├── package.json   npm workspaces + scripts that run both
└── License.md
```

Everything is TypeScript: NestJS sources in `backend/src`, and in the frontend `nuxt.config.ts`, the `.ts` composables, libraries and server routes, and `<script setup lang="ts">` in every Vue component. `npm run typecheck -w frontend` runs Vue's strict type check.

## Run it

Needs Node 22.13 or newer.

```bash
npm install
npm run dev
```

- Web app: http://localhost:3000
- API: http://localhost:4000/api (the Nuxt server proxies `/api/*` to it, so you only ever open port 3000)

For a production build:

```bash
npm run build
npm start
```

## Configuration

| Variable | Where | Default | What it does |
|---|---|---|---|
| `API_PORT` | backend | `4000` | API port (deliberately not `PORT`, which the web server uses) |
| `DATA_DIR` | backend | `backend/data` | Folder for `cashflow.db` |
| `NODE_ENV=production` | backend | — | Marks the session cookie `Secure` (use behind HTTPS) |
| `PORT` | frontend (production) | `3000` | Port for `node .output/server/index.mjs` |
| `NUXT_BACKEND_URL` | frontend | `http://localhost:4000` | Where `/api/*` is proxied (`BACKEND_URL` at build time also works) |

## How the daily allowance works

- **Monthly budget** = income − fixed bills − savings goal (set in Settings).
- **Today's allowance** = (budget − what you spent on earlier days this month) ÷ days left, including today.
- Spend less than the allowance and tomorrow's goes up; overspend and it shrinks.

## Backend (`backend/src`)

- `auth/` — sign up, log in, log out, `GET /api/me`, `PUT /api/settings`; scrypt password hashes, HTTP-only session cookie, login rate limit.
- `expenses/` — list, add and delete expenses, six-month trend, CSV export.
- `database/` — opens the SQLite file and creates the tables.
- `common/` — DTO validation helpers and the error filter (every error is `{ "error": "message" }`).

## Frontend (`frontend/`)

- `app/pages/` — `/` landing, `/login`, `/signup`, and `/app` (Today, Expenses, Where it goes, Settings). The dashboard renders client-side only.
- `app/layouts/dashboard.vue` — sidebar shell; loads the session and logs out if it has expired.
- `app/components/landing/` — page sections: hero, category ticker, stats, features, feature tour, how-it-works calculator, advantages, FAQ, call to action, footer.
- `app/components/ui/` — reusable pieces: theme toggle, scroll reveal and word-by-word headlines, animated counters, spotlight cards, marquee, accordion, scroll progress bar, back-to-top button, icons.
- `app/components/charts/` — donut, daily bar chart with tooltip, category bars, budget meter, six-month trend.
- `app/composables/` — `useTheme` (saved choice, else follows the system, no flash on load), `useScrollTo` (Lenis), `useToast`, `useApp` (session, month, data fetching), `useReveal`.
- `app/lib/` — plain TypeScript helpers: API client, money and date formatting, categories, budget maths.
- `server/` — Nitro server: `api/[...path].ts` proxies to NestJS; `middleware/auth-redirect.ts` sends logged-out visitors from `/app` to `/login` and logged-in ones the other way.
