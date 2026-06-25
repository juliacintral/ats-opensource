# ATS Open Source

> Applicant Tracking System enterprise, self-hosted, 100% open source.
> Stack: Next.js · NestJS · PostgreSQL · Prisma · Redis · Ollama (IA local)

[![CI](https://github.com/juliacintral/ats-opensource/actions/workflows/ci.yml/badge.svg)](https://github.com/juliacintral/ats-opensource/actions/workflows/ci.yml)
[![E2E](https://github.com/juliacintral/ats-opensource/actions/workflows/e2e.yml/badge.svg)](https://github.com/juliacintral/ats-opensource/actions/workflows/e2e.yml)

## Funcionalidades

- 📋 Pipeline de vagas com kanban drag-and-drop
- 🤖 Parsing de currículo com IA local (Ollama · Qwen3 · Llama3)
- 🎯 Score de aderência candidato × vaga
- 💬 Feedbacks estruturados com estrelas
- 📅 Agendamento de entrevistas com link Google Meet / Teams
- 🔐 Auth própria: JWT + Refresh Token + Bcrypt
- 📊 Dashboard e relatórios
- 🔍 Busca full-text nativa no PostgreSQL

---

## Início rápido (local)

### Pré-requisitos

- Node 20+
- Docker & Docker Compose
- [Ollama](https://ollama.com) instalado localmente

```bash
# 1. Clone
git clone https://github.com/juliacintral/ats-opensource
cd ats-opensource
npm install

# 2. Suba PostgreSQL + Redis + MinIO
docker compose -f docker/docker-compose.yml up -d

# 3. Variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
# edite os arquivos conforme necessário

# 4. Migrate + seed
cd apps/backend
npx prisma migrate dev
npx ts-node prisma/seed.ts
cd ../..

# 5. Baixe o modelo de IA
ollama pull qwen3

# 6. Rode tudo
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001/api
# Swagger:  http://localhost:3001/docs
```

**Credenciais do seed:**
| E-mail | Senha | Role |
|---|---|---|
| admin@ats.local | Admin@12345 | ADMIN |
| recruiter@ats.local | Recruiter@12345 | RECRUITER |

---

## Deploy gratuito para produção

> Nenhuma linha abaixo exige cartão de crédito.

### Opção A — Render + Supabase + Cloudflare Pages ⭐ Recomendada

| Serviço | O que roda | Free tier |
|---|---|---|
| [Cloudflare Pages](https://pages.cloudflare.com) | Frontend Next.js | Ilimitado de requests, 500 builds/mês |
| [Render](https://render.com) | Backend NestJS (Web Service) | 750 h/mês — dorme após inatividade |
| [Supabase](https://supabase.com) | PostgreSQL + Storage (currículo) | 500 MB DB, 1 GB storage |
| [Upstash](https://upstash.com) | Redis (JWT blacklist) | 10 k req/dia grátis |
| [Brevo](https://brevo.com) | SMTP e-mail | 300 e-mails/dia grátis |

#### 1. PostgreSQL — Supabase

```bash
# 1. Crie um projeto em https://app.supabase.com
# 2. Copie a Connection String (modo "URI") em Settings → Database
# Exemplo:
DATABASE_URL=postgresql://postgres:[senha]@db.[ref].supabase.co:5432/postgres
```

#### 2. Redis — Upstash

```bash
# 1. Crie um database em https://console.upstash.com
# 2. Copie o REDIS_URL (TLS)
REDIS_URL=rediss://default:[token]@[host].upstash.io:6380
```

#### 3. Backend — Render

1. Acesse [render.com](https://render.com) → **New Web Service** → conecte este repositório
2. Configurações:
   ```
   Root Directory: apps/backend
   Build Command:  npm ci && npx prisma generate && npm run build
   Start Command:  node dist/main
   Node Version:   20
   ```
3. Em **Environment Variables**, adicione:
   ```
   DATABASE_URL=<supabase url>
   REDIS_URL=<upstash url>
   JWT_SECRET=<gere com: openssl rand -hex 32>
   REFRESH_TOKEN_SECRET=<gere com: openssl rand -hex 32>
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d
   AI_PROVIDER=ollama
   OLLAMA_URL=https://seu-ollama.dominio.com   # ver seção IA abaixo
   FRONTEND_URL=https://seu-app.pages.dev
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=587
   MAIL_USER=<brevo login>
   MAIL_PASS=<brevo smtp key>
   MAIL_FROM=noreply@seudominio.com
   STORAGE_PROVIDER=supabase
   SUPABASE_URL=<supabase url>
   SUPABASE_KEY=<supabase service role key>
   ```
4. Clique em **Create Web Service**. O Render fará o deploy automaticamente a cada push.

> ⚠️ No free tier o serviço **dorme após 15 min de inatividade** e leva ~30s para acordar.
> Para evitar isso: use o [UptimeRobot](https://uptimerobot.com) (gratuito) para fazer ping a cada 5 min em `https://seu-backend.onrender.com/api/health`.

#### 4. Frontend — Cloudflare Pages

```bash
# Opção CLI
npm install -g wrangler
wrangler pages project create ats-opensource

# Build
cd apps/frontend
npm run build   # gera .next/
```

Ou pelo dashboard:
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → conecte GitHub
2. Configurações:
   ```
   Framework preset:  Next.js
   Root directory:    apps/frontend
   Build command:     npm run build
   Build output dir:  .next
   ```
3. Variáveis de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com/api
   ```
4. Clique em **Save and Deploy**.

---

### Opção B — Railway (plano Hobby free)

Railway oferece **$5 de crédito mensal grátis** sem cartão.

```bash
npm install -g @railway/cli
railway login
railway init
railway add postgresql   # provisiona Postgres automaticamente
railway add redis
railway up               # deploy backend
```

> Frontend: use Cloudflare Pages conforme Opção A.

---

### Opção C — VPS própria (Oracle Cloud Free Tier)

Oracle oferece **2 VMs ARM gratuitas para sempre** (4 OCPUs + 24 GB RAM cada).

```bash
# Na VM:
git clone https://github.com/juliacintral/ats-opensource
cd ats-opensource

# Configure .env de produção
cp apps/backend/.env.example apps/backend/.env
vim apps/backend/.env

# Suba tudo com Docker Compose
docker compose -f docker/docker-compose.prod.yml up -d

# Ollama na mesma VM
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3

# Nginx como reverse proxy + HTTPS com Certbot
sudo apt install nginx certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com
```

---

## IA local em produção

Para usar Ollama em servidor próprio (VPS ou Oracle Cloud):

```bash
# Instale Ollama na VPS
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull qwen3

# Exponha com autenticação básica via nginx
location /ollama/ {
    proxy_pass http://127.0.0.1:11434/;
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

Alternativas 100% gratuitas se não tiver VPS:

| Provedor | Free tier | Configuração |
|---|---|---|
| [OpenRouter](https://openrouter.ai) | Modelos free (Llama3, Qwen3, Gemma) | `AI_PROVIDER=openrouter`, `OPENROUTER_API_KEY=sk-...` |
| [Groq](https://groq.com) | 14 k req/dia, Llama3 ultra-rápido | `AI_PROVIDER=openrouter`, aponte para api.groq.com |
| [Google AI Studio](https://aistudio.google.com) | Gemini Flash gratuito | Adicione provider `GeminiProvider` seguindo a interface `AIProvider` |

---

## Testes E2E

```bash
# Instale browsers
cd apps/frontend
npx playwright install chromium

# Configure seed
cp e2e/.env.test.example e2e/.env.test

# Rode (backend + frontend devem estar rodando)
npx playwright test

# Com UI interativa
npx playwright test --ui

# Relatório HTML
npx playwright show-report
```

Suítes cobertas:
- ✅ `auth.spec.ts` — login, redirect, validação de campos
- ✅ `jobs.spec.ts` — listagem, criação, filtro, busca, kanban
- ✅ `candidates.spec.ts` — listagem, criação, busca, detalhe
- ✅ `interviews.spec.ts` — listagem, validação de formulário

---

## Estrutura do projeto

```
ats-opensource/
├── apps/
│   ├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   │   └── e2e/           # Playwright E2E tests
│   └── backend/           # NestJS + Prisma + PostgreSQL
│       └── prisma/        # Schema + migrations + seed
├── docker/
│   ├── docker-compose.yml       # Dev: PG + Redis + MinIO + Ollama
│   └── docker-compose.prod.yml  # Prod: + Nginx
├── .github/
│   └── workflows/
│       ├── ci.yml    # lint + build
│       └── e2e.yml   # Playwright no GitHub Actions
└── packages/shared/   # Tipos TypeScript compartilhados
```

---

## Variáveis de ambiente resumidas

### Backend (`apps/backend/.env`)

| Variável | Exemplo | Obrigatória |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | ✅ |
| `JWT_SECRET` | `openssl rand -hex 32` | ✅ |
| `REFRESH_TOKEN_SECRET` | `openssl rand -hex 32` | ✅ |
| `REDIS_URL` | `redis://localhost:6379` | ✅ |
| `AI_PROVIDER` | `ollama` ou `openrouter` | ✅ |
| `OLLAMA_URL` | `http://localhost:11434` | Se ollama |
| `OLLAMA_MODEL` | `qwen3` | Se ollama |
| `OPENROUTER_API_KEY` | `sk-or-...` | Se openrouter |
| `STORAGE_PROVIDER` | `supabase` ou `minio` | ✅ |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Se supabase |
| `SUPABASE_KEY` | service role key | Se supabase |
| `MAIL_HOST` | `smtp-relay.brevo.com` | ✅ |
| `FRONTEND_URL` | `https://seu-app.pages.dev` | ✅ |

### Frontend (`apps/frontend/.env.local`)

| Variável | Exemplo |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://seu-backend.onrender.com/api` |

---

## Contribuindo

1. Fork este repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit: `git commit -m 'feat: minha feature'`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

## Licença

MIT — use à vontade, inclusive para fins comerciais.
