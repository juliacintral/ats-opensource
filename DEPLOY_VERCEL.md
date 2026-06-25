# Deploy no Vercel — Frontend + Backend

Este projeto usa **dois projetos Vercel separados**:

| Projeto Vercel | Diretório | URL exemplo |
|---|---|---|
| `ats-frontend` | `apps/frontend` | `https://ats-frontend.vercel.app` |
| `ats-backend` | `apps/backend` | `https://ats-backend.vercel.app` |

---

## Por que dois projetos?

O Vercel executa o NestJS como **Serverless Function** (`api/index.ts`).
O Next.js é servido como **Edge/Static + SSR**.
Cada um tem seu ciclo de build independente.

---

## Serviços externos gratuitos necessários

| Serviço | O que faz | Link | Plano gratuito |
|---|---|---|---|
| **Supabase** | PostgreSQL + Storage | supabase.com | 500 MB DB, 1 GB storage |
| **Upstash** | Redis (sessions/cache) | upstash.com | 10k req/dia |
| **Brevo** | E-mail SMTP | brevo.com | 300 e-mails/dia |

---

## Passo 1 — Supabase (banco + storage)

```bash
# 1. Crie conta em supabase.com
# 2. New Project → anote:
#    - Connection String (Database URL)
#    - Project URL
#    - anon/public key

# 3. No painel: Storage → New bucket → nome: "resumes"
```

---

## Passo 2 — Upstash (Redis)

```bash
# 1. Crie conta em upstash.com
# 2. Create Database → região us-east-1 ou sa-east-1
# 3. Copie: UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
```

---

## Passo 3 — Deploy do Backend

### No Vercel Dashboard:

1. **New Project** → Import `juliacintral/ats-opensource`
2. **Root Directory**: `apps/backend`
3. **Framework Preset**: Other
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist` (ou deixe em branco)

### Environment Variables do backend:

```env
DATABASE_URL=postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres
REDIS_URL=rediss://default:[TOKEN]@[HOST].upstash.io:6379
JWT_SECRET=seu-jwt-secret-aqui-min-32-chars
REFRESH_TOKEN_SECRET=seu-refresh-secret-aqui-min-32-chars
FRONTEND_URL=https://ats-frontend.vercel.app
NODE_ENV=production
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=eyJ...
STORAGE_BUCKET=resumes
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua-brevo-api-key
```

6. Clique **Deploy**
7. Anote a URL: `https://ats-backend-xxx.vercel.app`

### Rodar o migrate (única vez, via Vercel CLI):

```bash
npm i -g vercel
vercel login

# Pull das env vars
cd apps/backend
vercel env pull .env.local

# Roda migrate apontando para Supabase
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

---

## Passo 4 — Deploy do Frontend

### No Vercel Dashboard:

1. **New Project** → Import `juliacintral/ats-opensource` (de novo)
2. **Root Directory**: `apps/frontend`
3. **Framework Preset**: Next.js (detecta automático)
4. **Build Command**: `npm run build`

### Environment Variables do frontend:

```env
NEXT_PUBLIC_API_URL=https://ats-backend-xxx.vercel.app
NEXT_PUBLIC_APP_URL=https://ats-frontend.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Clique **Deploy**

---

## Limitações do plano Hobby no Vercel

| Limite | Valor | Impacto no ATS |
|---|---|---|
| Execution timeout | 30s | OK para a maioria das APIs |
| Function memory | 1024 MB | Suficiente sem Ollama |
| Bandwidth | 100 GB/mês | OK para MVP |
| Build minutes | 6.000/mês | OK |
| Serverless invocations | 100k/mês | OK para MVP |

> ⚠️ **IA com Ollama não roda no Vercel** (sem GPU, timeout curto).
> Para usar IA, deixe `OLLAMA_URL` em branco — o sistema desativa automaticamente
> o ranking e parsing por IA, mantendo todas as outras funcionalidades.
> Para IA em produção: use Oracle Cloud Free Tier com Ollama + `OLLAMA_URL` externo.

---

## Deploy automático (git push → Vercel redeploya)

A cada `git push` na branch `main`, **ambos os projetos** Vercel fazem rebuild automaticamente.
Não é necessário nenhum comando manual após o setup inicial.

---

## Troubleshooting

### `Cannot find module` no build do backend
```bash
# Verifique se o tsconfig.json do backend tem:
# "outDir": "./dist",
# "rootDir": "./src"
```

### CORS error no frontend
```bash
# Confirme que FRONTEND_URL no backend aponta para a URL exata do frontend Vercel
# incluindo https:// e sem barra no final
```

### Prisma não encontra o banco
```bash
# Supabase exige ?pgbouncer=true&connection_limit=1 na connection string
# para modo serverless:
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Timeout na primeira request (cold start)
```bash
# Normal no plano Hobby — primeira request após inatividade leva 1-3s
# Para eliminar: upgrade para Pro ($20/mês) ou use Oracle Cloud + Docker
```
