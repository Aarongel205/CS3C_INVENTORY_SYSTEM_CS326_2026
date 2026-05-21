const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// ── Supabase REST helpers ──────────────────────────────────
const sb = {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },

  async get(table, params = '') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: this.headers
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async post(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async patch(table, id, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async delete(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!r.ok) throw new Error(await r.text());
    return true;
  }
};

// ── DB API ─────────────────────────────────────────────────
const DB = {
  async getItems() {
    return sb.get('items', 'select=*&order=created_at.desc');
  },

  async addItem(item) {
    return sb.post('items', item);
  },

  async updateItem(id, item) {
    return sb.patch('items', id, item);
  },

  async deleteItem(id) {
    return sb.delete('items', id);
  },

  async getLogs() {
    return sb.get('activity_logs', 'select=*&order=created_at.desc&limit=200');
  },

  async addLog(log) {
    return sb.post('activity_logs', log);
  }
};

// ── isConfigured check ─────────────────────────────────────
const SUPABASE_CONFIGURED =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY';


