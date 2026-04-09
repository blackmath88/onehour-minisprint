// ─────────────────────────────────────────────
// Decision Jam — Supabase config
// Fill in your project URL and anon key, then
// upload this file alongside prep.html and facilitate.html
// ─────────────────────────────────────────────
// Find these in: Supabase dashboard → Settings → API
const SUPABASE_URL  = 'https://rlsbzzlpgbhrytbxzxbn.supabase.co';
const SUPABASE_ANON = 'sb_publishable_0mbp8aRaV2rI2Z8lERoMhg_IOmcnWpF';

// ─── Tiny Supabase client (no npm needed) ────
const sb = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Prefer': 'return=representation'
  },

  async select(table, query = '') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: this.headers
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async update(table, query, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: 'PATCH',
      headers: { ...this.headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async delete(table, query) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!r.ok) throw await r.json();
    return r.ok;
  },

  async upsert(table, data, onConflict) {
    const url = `${SUPABASE_URL}/rest/v1/${table}` + (onConflict ? `?on_conflict=${onConflict}` : '');
    const r = await fetch(url, {
      method: 'POST',
      headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  }
};
