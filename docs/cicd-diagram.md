# CI/CD Pipeline Diagram
**Project:** StockWise Inventory Management System
**Assigned:** Aaron

---

## Pipeline Overview
![System pipeline](/assets/diagram.png)

## Pipeline Steps Explained

| Step | Tool | Purpose |
|------|------|---------|
| Checkout | `actions/checkout@v4` | Pull latest code from GitHub |
| Node setup | `actions/setup-node@v4` | Install Node.js 20 with npm cache |
| Install | `npm ci` | Clean install of exact dependency versions |
| Audit | `npm audit` | Fail build if high-severity vulnerabilities found |
| Test | `jest` | Run all unit tests; fail build if any test fails |
| Coverage | `upload-artifact` | Save HTML coverage report as CI artifact |
| Smoke test | `curl` | Hit `/api/health` after deploy to verify it's up |
| Deploy | Render webhook | Trigger production redeploy automatically |

---

## Branch Strategy

```
main   ──────●──────────────●─────── (production)
              \             /
dev    ─────────●──●──●────── (staging)
                       \
feature/xxx  ────────────●──── (feature work)
```

- All feature work done on `feature/` branches
- PRs merged into `dev` for integration testing  
- `dev` merged into `main` for production releases
