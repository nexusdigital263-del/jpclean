// Helper de acesso ao Supabase via REST (sem dependências). Use a Service Role Key.
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
export const hasSupabase = !!(URL && KEY);

function headers(extra) {
  return Object.assign({ apikey: KEY, authorization: "Bearer " + KEY, "content-type": "application/json" }, extra || {});
}

// Insere/atualiza linhas (upsert pela primary key)
export async function sbUpsert(table, rows) {
  if (!hasSupabase) return false;
  try {
    const r = await fetch(`${URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(rows),
    });
    return r.ok;
  } catch (e) { return false; }
}

// Lê linhas com uma query PostgREST (ex.: "t=gt.0&order=t.asc&limit=100")
export async function sbSelect(table, qs) {
  if (!hasSupabase) return [];
  try {
    const r = await fetch(`${URL}/rest/v1/${table}?${qs}`, { headers: headers() });
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}
