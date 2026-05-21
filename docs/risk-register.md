# Risk Register
**Project:** StockWise Inventory Management System
**Assigned:** Ced
**Last Updated:** May 2026

---

## Risk Scoring Guide
- **Likelihood:** 1 (Rare) → 5 (Almost Certain)
- **Impact:** 1 (Negligible) → 5 (Critical)
- **Risk Score = Likelihood × Impact**
- Low: 1–5 | Medium: 6–12 | High: 13–25

---

## Risk Register

| ID | Risk | Likelihood | Impact | Score | Level | Mitigation Plan | Owner |
|----|------|-----------|--------|-------|-------|----------------|-------|
| R-01 | Supabase service outage causes system downtime | 2 | 4 | 8 | Medium | Implement localStorage fallback; monitor Supabase status page | Ced |
| R-02 | API keys accidentally committed to GitHub | 2 | 5 | 10 | Medium | Use `.env` files; add `.gitignore`; rotate keys immediately if exposed | Niros |
| R-03 | SQL injection or malicious input in forms | 2 | 5 | 10 | Medium | Input validation on all API routes; Supabase parameterized queries | Niros |
| R-04 | Team member drops out or becomes unavailable | 3 | 4 | 12 | Medium | Document all tasks in GitHub; cross-train team members; use clear commit messages | Sophia |
| R-05 | Deployment fails on production environment | 3 | 3 | 9 | Medium | Write rollback steps in deployment plan; test on staging before main | Sophia |
| R-06 | Data loss due to accidental mass delete | 2 | 5 | 10 | Medium | Activity log tracks all deletes; confirm modal before deletion; Supabase point-in-time recovery | Aaron |
| R-07 | Jest tests fail after dependency update | 3 | 3 | 9 | Medium | Pin dependency versions in package.json; run `npm ci` in CI pipeline | Aaron |
| R-08 | Scope creep delays Sprint 1 delivery | 4 | 3 | 12 | Medium | Strict backlog prioritization; Scrum Master enforces sprint scope | Sophia |
| R-09 | Rate limiting blocks legitimate API traffic | 2 | 3 | 6 | Medium | Set generous limits (200 req/15min); monitor logs for false positives | Ced |
| R-10 | Outdated dependencies with known vulnerabilities | 3 | 4 | 12 | Medium | Run `npm audit` in CI; update dependencies regularly | Niros |
