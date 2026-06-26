// /api/state  — sincroniza TODOS os dados do CRM (config, preços, modelos, agenda, usuários) no Supabase
//  GET  -> retorna o documento único de estado
//  POST -> salva (upsert) o documento   Body: { "state": { ... } }
import { sbUpsert, sbSelect } from "./_supabase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const rows = await sbSelect("app_state", "id=eq.main&select=data");
    return res.status(200).json({ state: rows[0] ? rows[0].data : null });
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const state = body.state || {};
      const ok = await sbUpsert("app_state", { id: "main", data: state, updated_at: new Date().toISOString() });
      return res.status(200).json({ ok });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  }
  return res.status(405).end();
}
