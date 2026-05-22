# KPIs & Metrics
**Project:** StockWise Inventory Management System
**Assigned:** Sophia

---

## KPI Definitions

| # | KPI | Formula | Target | Measurement Method |
|---|-----|---------|--------|--------------------|
| 1 | **Total Inventory Value** | Sum of (quantity × sell_price) for all items | Track over time | Reports page → KPI card |
| 2 | **Stock Availability Rate** | (Items with qty > 0 / Total items) × 100 | ≥ 85% | Reports page → Stock availability |
| 3 | **Out-of-Stock Count** | Count of items where quantity = 0 | ≤ 5 items | Dashboard stat card |
| 4 | **Gross Margin** | Total retail value − Total cost value | Positive | Reports page → Gross Margin card |
| 5 | **Low Stock Alert Rate** | (Items at or below threshold / Total items) × 100 | ≤ 10% | Dashboard alert panel |

---

## Logging
Basic logging is implemented via `morgan` in `server.js`. All API requests are logged in Combined Log Format:
```
:remote-addr - :method :url :status :response-time ms
```

Logs are visible in the server terminal and in the Render dashboard log stream.

---

## How to Collect Real Measurements
1. Add at least 10 real items to the inventory
2. Open the **Reports** page
3. Record the values shown on each KPI card
4. Copy into `docs/metrics-report.md` for analysis
