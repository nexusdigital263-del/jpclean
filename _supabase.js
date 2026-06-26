# JP Clean — CRM Comercial · Guia de instalação do backend

Este guia tem **tudo o que você precisa configurar** para deixar o CRM 100% no ar, com WhatsApp e banco de dados reais. Siga na ordem.

> ⏱️ Tempo estimado: 30–45 min · Custo: começa **gratuito** (ver seção 7).

---

## 📦 O que tem nesta pasta

```
deploy/
├─ index.html                 ← o CRM completo (já pronto, não precisa editar)
├─ api/
│  ├─ ai.js                   ← IA (fala com a Anthropic com segurança)
│  ├─ leads.js                ← salva leads/conversas no Supabase
│  ├─ state.js                ← salva config, preços, agenda, usuários no Supabase
│  ├─ _supabase.js            ← conexão com o Supabase (usado pelos outros)
│  └─ whatsapp/
│     ├─ send.js              ← envia mensagem no WhatsApp
│     ├─ webhook.js           ← recebe mensagens (a Meta chama este endereço)
│     └─ messages.js          ← o CRM busca as mensagens recebidas
├─ supabase-schema.sql        ← cria as tabelas do banco (você roda 1x)
├─ .env.example               ← lista das chaves que vão na Vercel
├─ vercel.json
├─ package.json
└─ README.md                  ← este arquivo
```

Você vai precisar de 4 contas (todas com plano gratuito):
**Vercel** (hospedagem) · **Supabase** (banco) · **Meta/WhatsApp** (mensagens) · **Anthropic** (IA — opcional).

---

## 1️⃣ Publicar na Vercel

**Forma mais fácil (arrastar):**
1. Acesse **vercel.com** e crie uma conta (pode entrar com o GitHub/Google).
2. Vá em **Add New → Project → Deploy** e **arraste esta pasta `deploy/`** inteira.
3. Clique **Deploy**. Em ~1 min o CRM estará no ar em algo como `https://jpclean-crm.vercel.app`.

> Guarde esse endereço — é o seu CRM. Você pode ligar um domínio próprio depois.

Neste momento o CRM já abre e funciona (login, funil, agenda, orçamento…). Falta ligar o **banco** e o **WhatsApp**.

---

## 2️⃣ Criar o banco de dados (Supabase)

1. Acesse **supabase.com** → **New project** (escolha uma senha e a região "São Paulo").
2. Quando o projeto abrir, vá em **SQL Editor → New query**.
3. Abra o arquivo **`supabase-schema.sql`** desta pasta, copie todo o conteúdo, cole e clique **Run**. Isso cria as tabelas `messages`, `leads` e `app_state`.
4. Vá em **Project Settings → API** e copie dois valores:
   - **Project URL** → vai virar `SUPABASE_URL`
   - Em *Project API keys*, a chave **`service_role`** (clique em "reveal") → vai virar `SUPABASE_SERVICE_KEY`
   > ⚠️ Use a `service_role`, **nunca** a `anon`. Ela é secreta e fica só no servidor.

---

## 3️⃣ Conta de IA (opcional — pule se não quiser IA real agora)

1. Acesse **console.anthropic.com → API Keys → Create Key**.
2. Copie a chave (começa com `sk-ant-...`) → vai virar `ANTHROPIC_API_KEY`.

> Sem essa chave, a IA do CRM usa as **respostas-modelo prontas** (gratuitas). Com ela, vira IA de verdade.

---

## 4️⃣ WhatsApp (Meta Cloud API)

1. Acesse **developers.facebook.com → Meus Apps → Criar app → tipo "Empresa"**.
2. No painel do app, adicione o produto **WhatsApp**.
3. Em **WhatsApp → Configuração da API**, você verá e deve copiar:
   - **Identificação do número de telefone** (*Phone number ID*) → vira `WHATSAPP_PHONE_ID`
   - **Token de acesso** → vira `WHATSAPP_TOKEN`
4. Invente um segredo qualquer (ex.: `jpclean-2026`) → vira `WHATSAPP_VERIFY_TOKEN`.

> Para testar, a Meta dá um número de teste grátis. Para produção, registre o número da empresa (seção 7).

---

## 5️⃣ Colar as chaves na Vercel

1. Na Vercel, abra seu projeto → **Settings → Environment Variables**.
2. Adicione uma a uma (nomes exatamente assim — veja `.env.example`):

| Nome | De onde veio |
|---|---|
| `SUPABASE_URL` | Supabase (passo 2) |
| `SUPABASE_SERVICE_KEY` | Supabase (passo 2) |
| `WHATSAPP_TOKEN` | Meta (passo 4) |
| `WHATSAPP_PHONE_ID` | Meta (passo 4) |
| `WHATSAPP_VERIFY_TOKEN` | você inventou (passo 4) |
| `ANTHROPIC_API_KEY` | Anthropic (passo 3, opcional) |
| `AI_MODEL` | `claude-haiku-4-5` (opcional) |

3. Vá em **Deployments → (último) → ⋯ → Redeploy** para aplicar as chaves.

---

## 6️⃣ Ligar o Webhook do WhatsApp (receber mensagens)

1. Na Meta, em **WhatsApp → Configuração → Webhooks → Editar**:
   - **Callback URL:** `https://SEU-PROJETO.vercel.app/api/whatsapp/webhook`
   - **Verify token:** o mesmo valor de `WHATSAPP_VERIFY_TOKEN`
   - Clique **Verificar e salvar** (precisa aparecer ✅).
2. Em **Gerenciar campos do webhook**, assine o campo **messages**.

Depois, dentro do CRM: **Ajustes → Backend & Integrações**
- Deixe o **Endereço do backend em branco** (site e backend estão no mesmo domínio).
- Ative **Sincronizar WhatsApp pelo backend**.
- Em **Agente IA**, ligue a IA se quiser atendimento automático.

✅ **Pronto!** Mande uma mensagem do seu celular para o número do WhatsApp Business: ela aparece na Caixa de Entrada em segundos, e a IA responde (se ligada).

---

## 7️⃣ Custos — como ficar (quase) 100% grátis

- **Receber mensagens:** sempre **grátis**, em qualquer volume.
- **Responder em até 24h** após o cliente escrever: **grátis e ilimitado**.
- **Vercel + Supabase:** o **plano gratuito** atende um negócio pequeno tranquilamente.
- **Tem custo** apenas: mensagens que VOCÊ inicia ou envia **fora das 24h** (lembretes/follow-ups proativos = "mensagens template" da Meta) e a **IA real** (centavos por mensagem, da Anthropic).
- **Para ficar sem custo:** use a Cloud API direta da Meta, responda dentro das 24h e, se quiser, deixe a IA no modo respostas-modelo (sem `ANTHROPIC_API_KEY`).

> ❌ Não use bibliotecas "WhatsApp Web" não-oficiais (Baileys etc.): são grátis, mas violam as regras e podem **banir o número**.

### Token permanente (produção)
O token de acesso do passo 4 é temporário (~24h). Para produção, gere um **token de Usuário do Sistema** no *Business Manager → Configurações → Usuários do sistema*, com permissão de WhatsApp, e troque o `WHATSAPP_TOKEN` na Vercel.

---

## ❓ Problemas comuns

- **Webhook não verifica (sem ✅):** confira se o `WHATSAPP_VERIFY_TOKEN` na Vercel é idêntico ao digitado na Meta, e se você fez **Redeploy** depois de adicionar as chaves.
- **Mensagens não aparecem no CRM:** confirme que assinou o campo **messages** no webhook e que as chaves do Supabase estão certas (tabela `messages` criada).
- **IA respondendo "modelo" em vez de inteligente:** falta a `ANTHROPIC_API_KEY` (ou fez Redeploy depois de adicioná-la).
- **Dados não sincronizam entre dispositivos:** verifique `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` e se rodou o `supabase-schema.sql`.

Qualquer passo que travar, me chama que eu ajusto o código ou configuro junto. 🧡
