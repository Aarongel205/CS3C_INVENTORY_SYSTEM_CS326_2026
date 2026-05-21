// server.js — Express backend for StockWise Inventory System
// ASSIGNED: CED & NEIL (CI/CD, Risk, Maintenance)

const express = require('express');
const path    = require('path');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware (NIROS: Security assignment) ────────



// ── Rate Limiting (NIROS: Input validation / security) ─────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please slow down.' }
});

app.use('/api/', apiLimiter);

// ── Basic Authentication (NIROS: Security assignment) ──────
function basicAuth(req, res, next) {
  if (req.path === '/api/health') return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="StockWise API"');
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');

  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'stockwise2026';

  if (user === validUser && pass === validPass) return next();

  res.set('WWW-Authenticate', 'Basic realm="StockWise API"');
  return res.status(401).json({ error: 'Invalid credentials.' });
}


app.use('/api/', apiLimiter);

// ── General Middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

app.use(morgan('combined')); // Logging for KPIs / monitoring (SOPHIA)
app.use(express.json({ limit: '50kb' })); // Input size limit
app.use(express.urlencoded({ extended: false }));

// ── Serve Frontend ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check (CI/CD smoke test endpoint — AARON) ───────


// ── Input validation helper (NIROS: secure coding) ─────────


// ── Proxy routes to Supabase (optional — keeps key server-side) ──
// If you want to keep your Supabase service key private, proxy
// all DB requests through these routes instead of calling Supabase
// directly from the browser.

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '' // use SERVICE key on server
);

// GET /api/items
app.get('/api/items', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/items
app.post('/api/items', async (req, res) => {
  const errs = validateItem(req.body);
  if (errs.length) return res.status(400).json({ errors: errs });

  try {
    const { data, error } = await supabase
      .from('items')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/items/:id
app.patch('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const { data, error } = await supabase
      .from('items')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/logs
app.post('/api/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── 404 fallback → SPA ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[StockWise] Server running on http://localhost:${PORT}`);
  console.log(`[StockWise] Environment: ${process.env.NODE_ENV || 'development'}`);
});

 // for Jest tests (AARON: QA assignment)
