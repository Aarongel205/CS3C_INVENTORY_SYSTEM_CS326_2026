const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { transport: ws }
    })
  : null;

router.get('/', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'DB not configured' });
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([req.body])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;