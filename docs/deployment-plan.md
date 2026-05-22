# Deployment Plan
**Project:** StockWise Inventory Management System
**Assigned:** Sophia

---

## Deployment Strategy
**Strategy:** Rolling Deployment on Render (free tier)
Connect GitHub repository to Render. Every push to `main` triggers an automatic redeploy with zero downtime rolling update.

## Rollback Steps
If deployment breaks production:

1. Go to Render dashboard → **Deploys** tab
2. Click the last working deploy → **Rollback to this deploy**
3. Confirm rollback (takes ~1 minute)
4. Verify `/api/health` returns 200
5. Open a hotfix branch, fix the issue, re-deploy
