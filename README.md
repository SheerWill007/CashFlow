# Cashflow

Personal expense tracker with accounts, a daily spending allowance, and a breakdown of where the money goes.

## Run

Needs Node 22.13 or newer. There is nothing to install.

```bash
npm start
```

Then open http://localhost:4000 and sign up.

## How the daily allowance works

- **Monthly budget** = income − fixed bills − savings goal (set in Settings).
- **Today's allowance** = (budget − what you spent on earlier days this month) ÷ days left, including today.
- Spend less than the allowance and tomorrow's goes up; overspend and it shrinks.

## Layout

- `server.js` — HTTP server, JSON API, and SQLite storage (Node's built-in `node:sqlite`).
- `public/` — the single-page front end (plain HTML, CSS, and JavaScript).
- `data/cashflow.db` — created on first run; holds accounts and expenses. Not committed.

Passwords are hashed with scrypt; sessions are HTTP-only cookies. Set `NODE_ENV=production` behind HTTPS so the cookie is marked `Secure`, and `PORT` / `DATA_DIR` to change where it listens and stores data.
