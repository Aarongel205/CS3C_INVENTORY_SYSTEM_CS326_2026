const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws }
    })
  : null;

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

router.get('/', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const errs = validateItem(req.body);
  if (errs.length) return res.status(400).json({ errors: errs });
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { data, error } = await supabase.from('items').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

router.patch('/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { data, error } = await supabase.from('items').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { error } = await supabase.from('items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: true });
});

module.exports = router;