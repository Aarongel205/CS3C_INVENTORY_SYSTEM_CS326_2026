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

// ── Security Middleware (NIROS) ─────────────────────────────
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

// ── Basic Authentication (NIROS) ────────────────────────────
function basicAuth(req, res, next) {
  if (req.path === '/health') return next();

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

app.use('/api/', basicAuth);

// ── Rate Limiting (NIROS) ───────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please slow down.' }
});

app.use('/api/', apiLimiter);

// ── General Middleware ──────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(morgan('combined')); // 
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Serve Frontend ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check (AARON: CI/CD smoke test) ─────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    version:   process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development'
  });
});

// ── Input Validation (NIROS) ────────────────────────────────
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

// ── Supabase Client ─────────────────────────────────────────
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws }
    })
  : null;
  
// ── Routes (CED: Refactoring — TD-01) ──────────────────────
const itemsRouter = require('./routes/items');
const logsRouter  = require('./routes/logs');
app.use('/api/items', itemsRouter);
app.use('/api/logs',  logsRouter);

// ── 404 fallback → SPA ─────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[StockWise] Server running on http://localhost:${PORT}`);
  console.log(`[StockWise] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // for Jest tests (AARON: QA assignment)