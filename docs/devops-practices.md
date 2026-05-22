# DevOps Practices
**Project:** StockWise Inventory Management System
**Assigned:** Niros & Neil

---

## Version Control Strategy

**Tool:** Git + GitHub
**Branching Model:** Feature Branch Workflow

```
main    → production-ready code only
dev     → integration branch (all features merged here first)
feature/xxx → individual feature branches
hotfix/xxx  → emergency production fixes
```

**Commit message format:**
```
[TYPE] Short description

Types: feat | fix | docs | test | refactor | chore | ci
Example: feat: add stock adjustment modal
Example: fix: validate negative quantity in POST /api/items
```

---

## CI/CD Pipeline

**Tool:** GitHub Actions (`.github/workflows/ci.yml`)

| Trigger | Action |
|---------|--------|
| Push to any branch | Run tests + audit |
| Push to `main` | Run tests → smoke test → deploy |
| Pull Request to `main` | Run tests (block merge if failing) |

---

## Version Tagging

```bash
git tag v0.5.0   # Sprint 1 release
git tag v0.8.0   # Maintenance release
git tag v1.0.0   # Production release
git push origin --tags
```

---

## Cloud Integration

**Database:** Supabase (managed PostgreSQL)
- No server maintenance required
- Automatic backups (7-day retention on free tier)
- REST API eliminates need for ORM setup
- Row Level Security for access control

**Hosting:** Render.com
- Auto-deploy on push to `main`
- Environment variables managed in dashboard
- HTTPS enabled by default
- Zero-downtime rolling deploys

---

## Monitoring

- `morgan` logs all HTTP requests to stdout
- Render dashboard shows live log stream
- `/api/health` endpoint used for uptime monitoring
- Supabase dashboard shows DB query performance and usage

---

## Emerging Trends Applied

| Trend | How Applied |
|-------|------------|
| Infrastructure as Code | CI/CD pipeline defined in YAML (`.github/workflows/ci.yml`) |
| Serverless DB | Supabase managed PostgreSQL — no DB server to maintain |
| Automated testing | Jest + Supertest runs on every commit |
| GitOps | Production deploys triggered by Git push, not manual steps |
| Shift-left security | `npm audit` runs in CI before deploy, not after |
