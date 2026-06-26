// /api/leads  — sincroniza os leads/conversas do CRM com o Supabase
// Autossuficiente: não depende de outros arquivos.
//  GET  -> lista os leads salvos
//  POST -> salva (upsert) o array de leads   Body: { "leads": [ ... ] }
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
      var rows = await sbSelect("leads", "select=data&order=updated_at.desc&limit=1000");
      return res.status(200).json({ leads: rows.map(function (r) { return r.data; }).filter(Boolean) });
    }
    if (req.method === "POST") {
      var body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      var leads = Array.isArray(body.leads) ? body.leads : [];
      if (!leads.length) return res.status(200).json({ ok: true, count: 0 });
      var now = new Date().toISOString();
      var out = leads.map(function (l) { return { id: l.id, data: l, updated_at: now }; });
      var ok = await sbUpsert("leads", out);
      return res.status(200).json({ ok: ok, count: out.length });
    }
    return res.status(405).end();
  } catch (e) {
    return res.status(200).json({ leads: [], ok: false, error: String((e && e.message) || e) });
  }
};
