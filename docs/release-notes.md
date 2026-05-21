## v0.5 — May 2026 (Security Release)
**Tag:** `v1.0.0`
**Branch:** `main`

### New Features
- added security feature validation

### Bug Fixes
- Fixed negative quantity accepted by API (BUG-01)

### Security
- Helmet HTTP headers applied
- Rate limiting on all `/api/*` routes
- Input validation on POST and PATCH routes
- Secrets managed via `.env`
