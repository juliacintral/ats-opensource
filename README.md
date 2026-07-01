# 🎯 ATS Open Source

Sistema de Recrutamento (ATS) open source inspirado no Greenhouse.
Roda **100% no Vercel + Neon** — sem servidor separado, custo R$ 0/mês.

---

## 🚀 Deploy em 3 passos

### Passo 1 — Criar o banco de dados no Neon (2 min)

1. Acesse 👉 **https://neon.tech** e crie uma conta gratuita
2. Clique em **New Project**, dê um nome (ex: `ats-db`) e clique em **Create**
3. Na tela seguinte, copie a **Connection String** — parece com:
   ```
   postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   ⚠️ Guarde essa string, você vai usar no próximo passo.

---

### Passo 2 — Deploy no Vercel (3 min)

1. Acesse 👉 **https://vercel.com** e crie uma conta (pode usar o GitHub)
2. Clique em **Add New → Project**
3. Selecione o repositório **`ats-opensource`**
4. ⚠️ Em **"Root Directory"** coloque: `apps/frontend`
5. Em **"Environment Variables"** adicione as 3 variáveis abaixo:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | cole a connection string do Neon |
| `DIRECT_URL` | cole a mesma connection string do Neon |
| `JWT_SECRET` | qualquer texto longo (ex: `minha-chave-super-secreta-ats-2026-xpto`) |

6. Clique em **Deploy** e aguarde ~2 minutos

---

### Passo 3 — Criar as tabelas e usuário admin

Após o deploy, abra o terminal do seu computador e rode:

```bash
# Instala o Vercel CLI (só na primeira vez)
npm install -g vercel

# Faz login no Vercel
vercel login

# Baixa as variáveis de ambiente
cd apps/frontend
vercel env pull .env.local

# Cria as tabelas no banco
npx prisma migrate deploy

# Cria o usuário admin e dados de exemplo
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

✅ Pronto! Acesse sua URL do Vercel e faça login:
- **Email:** `admin@ats.com`
- **Senha:** `admin123`

---

## 🏗️ Arquitetura

```
Vercel (gratuito)
└── Next.js 14
    ├── /app/(dashboard)         → páginas do sistema
    └── /app/api/                → API REST completa
        ├── auth/login           → autenticação JWT
        ├── auth/me              → usuário logado
        ├── jobs                 → vagas
        ├── candidates           → candidatos
        ├── applications         → candidaturas + kanban
        ├── interviews           → entrevistas
        └── dashboard            → métricas

Neon (PostgreSQL gratuito)
└── Banco via Prisma ORM
```

## 📦 Stack

| Camada | Tecnologia | Custo |
|---|---|---|
| Frontend + API | Next.js 14 | Gratuito |
| Banco de dados | PostgreSQL via Neon | Gratuito |
| ORM | Prisma | Gratuito |
| Autenticação | JWT próprio | Gratuito |
| Deploy | Vercel | Gratuito |
| **Total** | | **R$ 0/mês** |

---

## 🆘 Problemas comuns

### Deploy falha com erro de build
Verifique se o **Root Directory** no Vercel está configurado como `apps/frontend`.

### Erro "DATABASE_URL not set"
As variáveis de ambiente não foram adicionadas. Vá em **Vercel → Settings → Environment Variables** e adicione as 3 variáveis.

### Erro ao fazer login
Rode o seed: `npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts`

### "Can't reach database server"
A connection string está errada. Volte ao Neon e copie novamente.
