// GET /api/whatsapp/messages?since=<timestamp>  — o CRM puxa as mensagens recebidas (Supabase)
// Autossuficiente: não depende de outros arquivos.
async function sbSelect(table, qs) {
  var URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !KEY) return [];
  try {
    var r = await fetch(URL + "/rest/v1/" + table + "?" + qs, {
      headers: { apikey: KEY, authorization: "Bearer " + KEY }
    });
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    var since = Number((req.query && req.query.since) || 0);
    var rows = await sbSelect("messages", "t=gt." + since + "&order=t.asc&limit=100");
    return res.status(200).json({ messages: rows });
  } catch (e) {
    return res.status(200).json({ messages: [], error: String((e && e.message) || e) });
  }
};
