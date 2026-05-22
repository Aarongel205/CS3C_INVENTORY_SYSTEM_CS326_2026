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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com", "fonts.googleapis.com"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || '*'],
      imgSrc:     ["'self'", "data:"]
    }
  }
}));


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
function validateItem(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1)
    errors.push('name is required');
  if (body.name && body.name.length > 200)
    errors.push('name must be ≤200 characters');
  if (body.quantity !== undefined && (isNaN(body.quantity) || body.quantity < 0))
    errors.push('quantity must be a non-negative number');
  if (body.sell_price !== undefined && (isNaN(body.sell_price) || body.sell_price < 0))
    errors.push('sell_price must be a non-negative number');
  return errors;
}


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

// ── 404 fallback → SPA ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[StockWise] Server running on http://localhost:${PORT}`);
  console.log(`[StockWise] Environment: ${process.env.NODE_ENV || 'development'}`);
});

 module.exports = app;// for Jest tests (AARON: QA assignment)
