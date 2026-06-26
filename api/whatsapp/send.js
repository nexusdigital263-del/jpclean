// POST /api/whatsapp/send  — envia uma mensagem de texto pelo WhatsApp Cloud API
// Body: { "to": "5534988120145", "text": "Olá!" }
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  var token = process.env.WHATSAPP_TOKEN, phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return res.status(500).json({ error: "WHATSAPP_TOKEN / WHATSAPP_PHONE_ID não configurados" });

  try {
    var body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    var to = String(body.to || "").replace(/\D/g, "");
    var text = String(body.text || "");
    if (!to || !text) return res.status(400).json({ error: "Informe 'to' e 'text'" });

    var r = await fetch("https://graph.facebook.com/v21.0/" + phoneId + "/messages", {
      method: "POST",
      headers: { authorization: "Bearer " + token, "content-type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: text } })
    });
    var data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || "Erro no WhatsApp" });
    return res.status(200).json({ ok: true, id: data.messages && data.messages[0] && data.messages[0].id });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
