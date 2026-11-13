# Cashflow

Personal expense tracker with accounts, a daily spending allowance, and a breakdown of where the money goes.

```
cashflow/
├── backend/    NestJS API + SQLite (node:sqlite)
├── frontend/   Next.js app (App Router) with Lenis smooth scroll and a light/dark theme
├── package.json   npm workspaces + scripts that run both
└── License.md
```

## Run it

Needs Node 22.13 or newer.

```bash
npm install
npm run dev
```

- Web app: http://localhost:3000
- API: http://localhost:4000/api (the web app proxies `/api/*` to it, so you only ever open port 3000)

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
| `BACKEND_URL` | frontend | `http://localhost:4000` | Where Next.js proxies `/api/*` |

## How the daily allowance works

- **Monthly budget** = income − fixed bills − savings goal (set in Settings).
- **Today's allowance** = (budget − what you spent on earlier days this month) ÷ days left, including today.
- Spend less than the allowance and tomorrow's goes up; overspend and it shrinks.

## Backend (`backend/src`)

- `auth/` — sign up, log in, log out, `GET /api/me`, `PUT /api/settings`; scrypt password hashes, HTTP-only session cookie, login rate limit.
- `expenses/` — list, add and delete expenses, six-month trend, CSV export.
- `database/` — opens the SQLite file and creates the tables.
- `common/` — DTO validation helpers and the error filter (every error is `{ "error": "message" }`).

## Frontend (`frontend/src`)

- `app/` — routes: `/` landing, `/login`, `/signup`, and `/app` (Today, Expenses, Where it goes, Settings).
- `components/landing/` — page sections: hero, category ticker, stats, features, feature tour, how-it-works calculator, advantages, FAQ, call to action, footer.
- `components/ui/` — reusable pieces: theme toggle, scroll reveal and word-by-word headlines, animated counters, spotlight cards, marquee, accordion, scroll progress bar, back-to-top button, icons.
- `components/charts/` — donut, daily bar chart with tooltip, category bars, budget meter, six-month trend.
- `components/providers/` — theme (saved choice, else follows the system, no flash on load), Lenis smooth scrolling (turns itself off for "reduce motion"), toasts.
