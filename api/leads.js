// POST /api/ai  — proxy seguro para a OpenAI (a chave fica só no servidor)
// Body aceito: { "prompt": "..." }  ou  { "messages": [{role,content}], "max_tokens": 1024 }
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY não configurada na Vercel" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const messages = Array.isArray(body.messages) && body.messages.length
      ? body.messages
      : [{ role: "user", content: String(body.prompt || "") }];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify({
        model: body.model || process.env.AI_MODEL || "gpt-4o-mini",
        max_tokens: body.max_tokens || 1024,
        temperature: 0.6,
        messages: messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || "Erro na OpenAI" });
    const text = (((data.choices || [])[0] || {}).message || {}).content || "";
    return res.status(200).json({ text: String(text).trim() });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
