# StockWise — Item Inventory Management System

A full-stack inventory system built with HTML/CSS/JS, Express, and Supabase.

---

## Project Team

| Member | Assignment |
|--------|-----------|
| Sophia | Planning & Backlog, Deployment & Support, KPIs & Metrics |
| Ced    | Risk Management, Maintenance & Refactoring, Cost-Benefit |
| Aaron  | QA & Testing, CI/CD Upgrade, Cost-Benefit |
| Niros  | Git Mastery, Software Security |
| Neil   | CI & Change Log, Ethical/Legal/IP, DevOps |

---

## Features

- Add, edit, delete inventory items
- Stock adjustment (add/remove/set)
- Low stock & out-of-stock alerts
- Category filtering & sorting
- CSV export
- Activity/audit log
- Reports & KPIs dashboard
- Supabase real-time database
- Works offline with localStorage fallback

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Set up Supabase
1. Go to https://app.supabase.com → New project
2. Open **SQL Editor** and run the schema from `public/js/supabase-client.js`
3. Copy your **Project URL** and **anon key** from Project Settings → API
4. Paste into `.env` AND into `public/js/supabase-client.js`

### 4. Run the server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Open http://localhost:3000

---

## Testing (AARON — QA Assignment)
```bash
npm test              # run Jest tests
npm test -- --coverage # with coverage report
```

Tests are in `tests/server.test.js`. Covers:
- Health check endpoint
- Input validation (name, quantity, price)
- Static file serving
- Rate limiting headers

---

## Security (NIROS — Security Assignment)
- `helmet` for HTTP security headers
- `express-rate-limit` on all `/api/*` routes
- Input validation before any DB write
- `.env` for secrets (never committed)
- `npm audit` in CI pipeline

---

## CI/CD (NEIL & AARON)
GitHub Actions workflow in `.github/workflows/ci.yml`:
1. Runs `npm audit` on every push
2. Runs Jest tests
3. Uploads coverage report
4. Runs smoke test (`GET /api/health`)
5. Deploys on merge to `main`

---

## Deployment (SOPHIA)
Recommended platforms:
- **Render** (free tier) — connect GitHub repo, set env vars
- **Railway** — `railway up`
- **Fly.io** — `fly launch`
- **Vercel** — serverless (adjust server.js for serverless export)

---

## Versioning (NIROS)
```bash
git tag v0.5.0
git push origin v0.5.0
```

---

## License
MIT — see LICENSE file
