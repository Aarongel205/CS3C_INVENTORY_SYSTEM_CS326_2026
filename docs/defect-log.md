# Defect Log
**Project:** StockWise Inventory Management System
**Assigned:** Aaron


## Defect Summary

| ID | Title | Severity | Status | Reported By | Date |
|----|-------|----------|--------|-------------|------|
| BUG-01 | Negative quantity accepted by API without validation | High | Close | Aaron | April 2026 |

## BUG-01 — Negative Quantity Accepted

**Title:** Negative quantity accepted by API without validation
**Severity:** High
**Status:** ✅ Closed
**Reported By:** Aaron
**Date Reported:** April 2026
**Date Fixed:** April 2026

### Description
The `POST /api/items` endpoint accepted negative values for the `quantity` field (e.g., `quantity: -5`). This caused items to be saved with invalid stock levels, breaking the dashboard stats and status calculations.

### Steps to Reproduce
1. Send a POST request to `/api/items` with `quantity: -5`
2. Observe that the item is saved successfully with quantity = -5
3. Dashboard shows negative total stock

### Expected Behavior
The API should return HTTP 400 with a validation error message when quantity is negative.

### Actual Behavior
API returned HTTP 201 and saved the item with a negative quantity.

### Root Cause
The `validateItem()` function in `server.js` did not include a check for negative quantity values.

### Fix Applied
Added the following check to `validateItem()` in `server.js`:
```js
if (body.quantity !== undefined && (isNaN(body.quantity) || body.quantity < 0))
  errors.push('quantity must be a non-negative number');
```

### Verification
- Jest test `TC-02` now passes: `POST /api/items with negative quantity → 400`
- Run `npm test` to confirm