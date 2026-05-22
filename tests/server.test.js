// tests/server.test.js
// ASSIGNED: AARON — Software Quality Assurance + Testing

const request = require('supertest');
const app     = require('../server');

// helper: adds Basic Auth header to every request
const auth = { user: 'admin', pass: 'stockwise2026' };

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
      .auth(auth.user, auth.pass)
      .send({ quantity: 10, sell_price: 99.99 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('rejects negative quantity', async () => {
    const res = await request(app)
      .post('/api/items')
      .auth(auth.user, auth.pass)
      .send({ name: 'Test Item', quantity: -5, sell_price: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.includes('quantity'))).toBe(true);
  });

  test('rejects name longer than 200 characters', async () => {
    const res = await request(app)
      .post('/api/items')
      .auth(auth.user, auth.pass)
      .send({ name: 'A'.repeat(201), quantity: 1, sell_price: 10 });
    expect(res.statusCode).toBe(400);
  });

  test('rejects negative sell_price', async () => {
    const res = await request(app)
      .post('/api/items')
      .auth(auth.user, auth.pass)
      .send({ name: 'Test', quantity: 5, sell_price: -100 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.includes('sell_price'))).toBe(true);
  });

  test('accepts a valid item (passes validation layer)', async () => {
    const res = await request(app)
      .post('/api/items')
      .auth(auth.user, auth.pass)
      .send({ name: 'Valid Item', quantity: 10, sell_price: 49.99, category: 'Test' });
    expect(res.statusCode).not.toBe(400);
  });
});

// ── PATCH validation ───────────────────────────────────────
describe('PATCH /api/items/:id', () => {
  test('returns 401 or 400 or 500 with invalid uuid', async () => {
    const res = await request(app)
      .patch('/api/items/not-a-uuid')
      .auth(auth.user, auth.pass)
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

// ── Unauthorized access ────────────────────────────────────
describe('Basic Auth', () => {
  test('returns 401 without credentials', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Test' });
    expect(res.statusCode).toBe(401);
  });

  test('returns 401 with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/items')
      .auth('wrong', 'wrong')
      .send({ name: 'Test' });
    expect(res.statusCode).toBe(401);
  });
});