# QA Plan
**Project:** StockWise Inventory Management System
**Assigned:** Aaron
**Last Updated:** May 2026



## Objectives
- Ensure all API endpoints behave correctly and securely
- Verify input validation rejects malformed data
- Confirm the frontend renders without errors
- Maintain ≥80% code coverage on backend routes

## Test Types

### Unit Tests
Test individual functions and route handlers in isolation.
- Tool: **Jest** + **Supertest**
- Location: `tests/server.test.js`
- Run: `npm test`

### Integration Tests
Test the interaction between Express routes and Supabase.
- Tool: Jest with real Supabase test project
- Triggered in CI via GitHub Actions

### Manual / Exploratory Testing
- Performed by team members in the browser
- Covers UI flows: add item, edit, delete, stock adjust, export CSV
- Documented in the defect log if bugs are found

### Smoke Tests
- Automated via GitHub Actions after every deployment
- Hits `GET /api/health` and expects HTTP 200

## Test Cases
| ID | Type | Description | Expected Result |
|----|------|-------------|----------------|
| TC-01 | Unit | GET /api/health | 200 OK, body has `status: "ok"` |
| TC-02 | Unit | POST /api/items with no name | 400, errors array returned |
| TC-03 | Unit | POST /api/items with negative quantity | 400, error mentions quantity |
| TC-04 | Unit | POST /api/items with name > 200 chars | 400 Bad Request |
| TC-05 | Unit | POST /api/items with negative sell_price | 400, error mentions sell_price |
| TC-06 | Unit | POST /api/items with valid data | Not 400 (passes validation) |
| TC-07 | Unit | GET / serves index.html | 200, content-type HTML |
| TC-08 | Unit | Rate limit headers present | ratelimit-limit header exists |
| TC-09 | Manual | Add item via form | Item appears in inventory table |
| TC-10 | Manual | Delete item | Item removed, logged in activity log |