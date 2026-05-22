# System Architecture
**Project:** StockWise Inventory Management System
**Assigned:** Niros & Neil

---

## Architecture Overview

![System Architecture](/assets/stockwise_architecture.svg)
---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | HTML5, CSS3, Vanilla JS | Lightweight, no build step required |
| Backend | Node.js + Express | Simple, widely used, easy to deploy |
| Database | Supabase (PostgreSQL) | Free tier, real-time, REST API built-in |
| Hosting | Render.com | Free tier, auto-deploy from GitHub |
| CI/CD | GitHub Actions | Integrated with repo, free for public repos |
| Testing | Jest + Supertest | Industry standard for Node.js |
| Security | Helmet + express-rate-limit | Best practice HTTP security |

---

## Data Flow: Add Item

```
User fills form → clicks Save
        │
        ▼
app.js validates required fields (client-side)
        │
        ▼
supabase-client.js POSTs to Supabase REST API
        │
        ▼
Supabase saves to items table
        │
        ▼
Response returned → item added to local array
        │
        ▼
UI re-renders inventory table + dashboard
        │
        ▼
Activity log entry created in activity_logs table
```
