// tests/server.test.js
// ASSIGNED: AARON — Software Quality Assurance + Testing
// Run: npm test

const request = require('supertest');
const app     = require('../server');

// ── Health check ───────────────────────────────────────────
describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });
});

// ── Input validation unit tests ────────────────────────────
describe('POST /api/items — validation', () => {
  test('rejects item with no name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ quantity: 10, sell_price: 99.99 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('rejects negative quantity', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item', quantity: -5, sell_price: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.includes('quantity'))).toBe(true);
  });

  test('rejects name longer than 200 characters', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'A'.repeat(201), quantity: 1, sell_price: 10 });
    expect(res.statusCode).toBe(400);
  });

  test('rejects negative sell_price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', quantity: 5, sell_price: -100 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.includes('sell_price'))).toBe(true);
  });

  test('accepts a valid item (passes validation layer)', async () => {
    // NOTE: this will hit the actual Supabase — OK to fail at DB level,
    // we just check that validation passes (no 400 from our validation).
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Valid Item', quantity: 10, sell_price: 49.99, category: 'Test' });
    // Validation should pass (200/201/500 are all fine here)
    expect(res.statusCode).not.toBe(400);
  });
});

// ── PATCH validation ───────────────────────────────────────
describe('PATCH /api/items/:id', () => {
  test('returns 400 or 500 with invalid uuid format (not 400 from our code)', async () => {
    const res = await request(app)
      .patch('/api/items/not-a-uuid')
      .send({ quantity: 5 });
    expect([400, 500]).toContain(res.statusCode);
  });
});

// ── Static files ───────────────────────────────────────────
describe('Static files', () => {
  test('GET / serves index.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

// ── Rate limiting headers ──────────────────────────────────
describe('Rate limit headers', () => {
  test('API responses include RateLimit headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
  });
});
