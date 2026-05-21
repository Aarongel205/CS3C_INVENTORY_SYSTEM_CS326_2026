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
