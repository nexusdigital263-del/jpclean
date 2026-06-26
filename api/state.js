// /api/state  — sincroniza config, preços, modelos, agenda e usuários no Supabase
// Autossuficiente: não depende de outros arquivos.
//  GET  -> retorna o documento único de estado
//  POST -> salva (upsert) o documento   Body: { "state": { ... } }
async function sbUpsert(table, rows) {
  var URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !KEY) return false;
  try {
    var r = await fetch(URL + "/rest/v1/" + table, {
      method: "POST",
      headers: { apikey: KEY, authorization: "Bearer " + KEY, "content-type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows)
    });
    return r.ok;
  } catch (e) { return false; }
}
async function sbSelect(table, qs) {
  var URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !KEY) return [];
  try {
    var r = await fetch(URL + "/rest/v1/" + table + "?" + qs, { headers: { apikey: KEY, authorization: "Bearer " + KEY } });
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    if (req.method === "GET") {
      var rows = await sbSelect("app_state", "id=eq.main&select=data");
      return res.status(200).json({ state: rows[0] ? rows[0].data : null });
    }
    if (req.method === "POST") {
      var body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      var state = body.state || {};
      var ok = await sbUpsert("app_state", { id: "main", data: state, updated_at: new Date().toISOString() });
      return res.status(200).json({ ok: ok });
    }
    return res.status(405).end();
  } catch (e) {
    return res.status(200).json({ state: null, ok: false, error: String((e && e.message) || e) });
  }
};
