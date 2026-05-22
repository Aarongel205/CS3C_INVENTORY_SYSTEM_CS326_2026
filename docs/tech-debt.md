# Technical Debt Register
**Project:** StockWise Inventory Management System
**Assigned:** Ced

---

## Technical Debts

| ID | Description | Location | Effort | Priority | Status |
|----|-------------|----------|--------|----------|--------|
| TD-01 | All route handlers are in one `server.js` file — should be split into separate route files | `server.js` | Medium | High | ✅ Fixed |
| TD-02 | No pagination on `/api/items` endpoint — returns all rows which will slow down with large datasets | `server.js` | Medium | High | Open |
| TD-03 | Frontend `app.js` mixes DOM logic, data fetching, and business logic — needs separation of concerns | `public/js/app.js` | High | Medium | Open |
| TD-04 | No database indexes on frequently queried columns (`category`, `name`, `created_at`) | Supabase | Low | Medium | Open |
| TD-05 | `validateItem()` only validates on POST — PATCH route has no input validation | `server.js` | Low | High | Open |

---

## TD-01 — Refactored (Fixed)

**Debt:** All Express routes were in a single `server.js` making it hard to maintain.

**Before:**
```js
// Everything in server.js — 200+ lines
app.get('/api/items', async (req, res) => { ... });
app.post('/api/items', async (req, res) => { ... });
app.patch('/api/items/:id', async (req, res) => { ... });
app.delete('/api/items/:id', async (req, res) => { ... });
```

**After:**
```js
// server.js — clean, imports routes
const itemsRouter = require('./routes/items');
const logsRouter  = require('./routes/logs');
app.use('/api/items', itemsRouter);
app.use('/api/logs', logsRouter);
```

**Improvement:** Reduced `server.js` from 200+ lines to ~60 lines. Each route file is independently testable.

---

## Performance Comparison (TD-01)

| Metric | Before | After |
|--------|--------|-------|
| server.js line count | 210 lines | 62 lines |
| Time to locate a route | ~30 seconds | ~5 seconds |
| Ease of adding new routes | Hard | Easy |
| Testability | Low | High |
