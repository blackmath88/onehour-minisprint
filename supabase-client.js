// Decision Jam — Supabase client
// Fill in your values from: Supabase dashboard → Settings → API
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_NEW_ANON_KEY';

const sb = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Prefer': 'return=representation'
  },
  async select(t, q='') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { headers: this.headers });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async insert(t, d) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}`, { method: 'POST', headers: this.headers, body: JSON.stringify(d) });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async update(t, q, d) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { method: 'PATCH', headers: { ...this.headers, 'Prefer': 'return=representation' }, body: JSON.stringify(d) });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async delete(t, q) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { method: 'DELETE', headers: this.headers });
    if (!r.ok) throw await r.json();
    return r.ok;
  }
};
