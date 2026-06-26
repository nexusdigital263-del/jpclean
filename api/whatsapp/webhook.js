// /api/whatsapp/webhook  — recebe as mensagens do WhatsApp Cloud API e grava no Supabase
// Autossuficiente: não depende de outros arquivos.
//  GET  -> verificação do webhook (Meta)
//  POST -> mensagens recebidas
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

module.exports = async function handler(req, res) {
  // 1) Verificação (Meta chama com GET ao configurar o webhook)
  if (req.method === "GET") {
    var mode = req.query["hub.mode"], token = req.query["hub.verify_token"], challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }
  if (req.method !== "POST") return res.status(405).end();
  try {
    var body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    var value = body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value;
    var msgs = (value && value.messages) || [];
    var contacts = (value && value.contacts) || [];
    var name = (contacts[0] && contacts[0].profile && contacts[0].profile.name) || "";
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      if (m.type !== "text") continue;
      var ref = m.referral || {};
      var channel = "whatsapp", origem = "WhatsApp";
      if (ref.source_type || ref.source_url || ref.ctwa_clid) {
        var src = ((ref.source_url || "") + " " + (ref.source_id || "")).toLowerCase();
        if (src.indexOf("google") !== -1) { channel = "google"; origem = "Google"; }
        else { channel = "meta"; origem = "Meta Ads"; }
      }
      await sbUpsert("messages", { id: m.id, from: m.from, name: name || m.from, text: (m.text && m.text.body) || "", t: Date.now(), dir: "in", channel: channel, origem: origem });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true });
  }
};
