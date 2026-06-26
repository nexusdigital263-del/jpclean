# ===========================================================
#  JP Clean CRM — Variáveis de ambiente
#  Cole estas chaves na Vercel: Project → Settings → Environment Variables
#  (NUNCA coloque valores reais dentro do index.html)
# ===========================================================

# ---------- IA (opcional — só se quiser a IA REAL) ----------
# Crie em: console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
# Modelo (pode deixar assim):
AI_MODEL=claude-haiku-4-5

# ---------- WhatsApp Cloud API (Meta) ----------
# developers.facebook.com → seu app → WhatsApp → Configuração da API
WHATSAPP_TOKEN=EAAGxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345
# Um segredo que VOCÊ inventa (use o MESMO na configuração do webhook na Meta):
WHATSAPP_VERIFY_TOKEN=jpclean-um-segredo-qualquer

# ---------- Supabase (banco de dados) ----------
# supabase.com → seu projeto → Project Settings → API
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
# Use a chave "service_role" (secreta) — NUNCA a anon/public:
SUPABASE_SERVICE_KEY=eyJhbGciOi...
