// /api/leads  — sincroniza os leads/conversas do CRM com o Supabase
//  GET  -> lista os leads salvos
//  POST -> salva (upsert) o array de leads enviado pelo CRM   Body: { "leads": [ ... ] }
import { sbUpsert, sbSelect } from "./_supabase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const rows = await sbSelect("leads", "select=data&order=updated_at.desc&limit=1000");
    return res.status(200).json({ leads: rows.map((r) => r.data).filter(Boolean) });
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const leads = Array.isArray(body.leads) ? body.leads : [];
      if (!leads.length) return res.status(200).json({ ok: true, count: 0 });
      const now = new Date().toISOString();
      const rows = leads.map((l) => ({ id: l.id, data: l, updated_at: now }));
      const ok = await sbUpsert("leads", rows);
      return res.status(200).json({ ok, count: rows.length });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  }
  return res.status(405).end();
}
