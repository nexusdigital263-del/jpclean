// /api/whatsapp/webhook  — recebe as mensagens do WhatsApp Cloud API e grava no Supabase
//  GET  -> verificação do webhook (Meta)
//  POST -> mensagens recebidas
import { sbUpsert } from "../_supabase.js";

export default async function handler(req, res) {
  // 1) Verificação (Meta chama com GET ao configurar o webhook)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // 2) Recebimento de mensagens
  if (req.method !== "POST") return res.status(405).end();
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const value = body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value;
    const msgs = (value && value.messages) || [];
    const contacts = (value && value.contacts) || [];
    const name = (contacts[0] && contacts[0].profile && contacts[0].profile.name) || "";

    for (const m of msgs) {
      if (m.type !== "text") continue;
      await sbUpsert("messages", {
        id: m.id,
        from: m.from,
        name: name || m.from,
        text: (m.text && m.text.body) || "",
        t: Date.now(),
        dir: "in",
      });
    }
    // Responde 200 sempre, para a Meta não reenviar em massa
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true });
  }
}
