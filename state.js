// POST /api/ai  — proxy seguro para a API da Anthropic (a chave fica só no servidor)
// Body aceito: { "prompt": "..." }  ou  { "messages": [{role,content}], "max_tokens": 1024 }
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada na Vercel" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const messages = Array.isArray(body.messages) && body.messages.length
      ? body.messages
      : [{ role: "user", content: String(body.prompt || "") }];

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || process.env.AI_MODEL || "claude-haiku-4-5",
        max_tokens: body.max_tokens || 1024,
        messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || "Erro na Anthropic" });
    const text = (data.content || []).map((c) => c.text || "").join("").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
