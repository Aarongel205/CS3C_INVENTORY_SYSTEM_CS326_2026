# System Architecture
**Project:** StockWise Inventory Management System
**Assigned:** Niros & Neil

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  CLIENT LAYER                   │
│                                                 │
│  Browser (Chrome / Firefox / Mobile)            │
│  ┌─────────────────────────────────────────┐   │
│  │  index.html + style.css + app.js        │   │
│  │  Single Page App (SPA)                  │   │
│  │  - Dashboard, Inventory, Reports, Logs  │   │
│  │  - LocalStorage fallback when offline   │   │
│  └─────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST
                     ▼
┌─────────────────────────────────────────────────┐
│                 SERVER LAYER                    │
│                                                 │
│  Node.js + Express (Render.com)                 │
│  ┌─────────────────────────────────────────┐   │
│  │  server.js                              │   │
│  │  - Serves static frontend files         │   │
│  │  - REST API: /api/items, /api/logs      │   │
│  │  - Input validation                     │   │
│  │  - Rate limiting (200 req/15min)        │   │
│  │  - Helmet security headers              │   │
│  │  - Morgan request logging               │   │
│  └─────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / Supabase REST API
                     ▼
┌─────────────────────────────────────────────────┐
│                DATABASE LAYER                   │
│                                                 │
│  Supabase (PostgreSQL — Singapore region)       │
│  ┌────────────────┐  ┌───────────────────────┐ │
│  │  items table   │  │  activity_logs table  │ │
│  │  - id (UUID)   │  │  - id (UUID)          │ │
│  │  - name        │  │  - action             │ │
│  │  - sku         │  │  - item_name          │ │
│  │  - category    │  │  - detail             │ │
│  │  - quantity    │  │  - created_at         │ │
│  │  - price       │  └───────────────────────┘ │
│  │  - etc.        │                             │
│  └────────────────┘                             │
│  Row Level Security (RLS) enabled               │
└─────────────────────────────────────────────────┘
```

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
