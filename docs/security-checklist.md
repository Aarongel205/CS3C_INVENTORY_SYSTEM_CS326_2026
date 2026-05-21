# Security Checklist
**Project:** StockWise Inventory Management System
**Assigned:** Niros

---

## Security Measures Implemented

### 1. Input Validation (2 places)

**Place 1 — `server.js` `validateItem()` function:**
```js
function validateItem(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 1) errors.push('name is required');
  if (body.name && body.name.length > 200) errors.push('name must be ≤200 chars');
  if (body.quantity !== undefined && (isNaN(body.quantity) || body.quantity < 0))
    errors.push('quantity must be non-negative');
  if (body.sell_price !== undefined && (isNaN(body.sell_price) || body.sell_price < 0))
    errors.push('sell_price must be non-negative');
  return errors;
}
```

**Place 2 — `express.json({ limit: '50kb' })`:**
Limits request body size to prevent large payload attacks.

---

### 2. HTTP Security Headers — `helmet`
Applied via `app.use(helmet(...))` with a custom Content Security Policy:
- Blocks inline scripts from untrusted sources
- Restricts font/style loading to trusted CDNs only
- Prevents clickjacking (`X-Frame-Options`)
- Enforces `X-Content-Type-Options: nosniff`

---

### 3. Rate Limiting — `express-rate-limit`
```js
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', apiLimiter);
```
Limits each IP to 200 requests per 15 minutes on all API routes.

---

### 4. Sensitive Values Protected
- Supabase URL and keys stored in `.env` (never hardcoded)
- `.env` listed in `.gitignore` — never committed to GitHub
- `.env.example` provided as a safe template

---

### 5. Dependency Audit
Run: `npm audit`

```bash
npm audit --audit-level=high
```
Also runs automatically in GitHub Actions CI on every push.

---

## Security Risks

| Risk ID | Description |
|---------|-------------|
| R-02 | API keys accidentally committed to GitHub |
| R-03 | SQL injection or malicious input in forms |
| R-10 | Outdated dependencies with known vulnerabilities |

---

## Recommended Future Improvements
- Add JWT-based authentication for admin access
- Implement HTTPS redirect in production
- Add CSRF protection for state-changing requests
- Enable Supabase Row Level Security with user-based policies
