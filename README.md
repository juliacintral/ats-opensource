# 🎯 ATS Open Source

Sistema de Recrutamento open source. Roda 100% no **Vercel + Neon**, custo R$ 0/mês.

---

## 🚀 Deploy em 3 passos

### 1 — Banco de dados no Neon
1. Acesse 👉 **https://neon.tech** e crie uma conta
2. Clique em **New Project** → dê um nome → Create
3. Copie a **Connection String** (começa com `postgresql://...`)

### 2 — Deploy no Vercel
1. Acesse 👉 **https://vercel.com**
2. **Add New → Project** → selecione `ats-opensource`
3. ⚠️ **Root Directory: deixe em branco** (o projeto já está na raiz)
4. Em **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | connection string do Neon |
| `DIRECT_URL` | mesma connection string |
| `JWT_SECRET` | qualquer texto longo |

5. Clique em **Deploy**

### 3 — Criar tabelas (uma única vez)

Após o deploy, abra o terminal e rode:
```bash
npm install -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

✅ Acesse sua URL do Vercel:
- **Email:** `admin@ats.com`
- **Senha:** `admin123`

---

## 📦 Stack
| Next.js 14 | Prisma | PostgreSQL (Neon) | JWT | Vercel |
|---|---|---|---|---|
| Frontend + API | ORM | Banco grátis | Auth | Hospedagem grátis |
