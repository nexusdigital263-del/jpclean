// GET /api/whatsapp/messages?since=<timestamp>  — o CRM puxa as mensagens recebidas (Supabase)
var sb = require("../_supabase.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const since = Number(req.query.since || 0);
  const rows = await sb.sbSelect("messages", "t=gt." + since + "&order=t.asc&limit=100");
  return res.status(200).json({ messages: rows });
};
