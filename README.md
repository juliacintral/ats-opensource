# ATS Open Source

Aplicação ATS (Applicant Tracking System) open source construída com **Next.js 14 + Prisma + PostgreSQL**, hospedada integralmente no **Vercel** — sem nenhuma infraestrutura adicional.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend + Backend | Next.js 14 (App Router + API Routes) |
| Banco de dados | PostgreSQL via Neon (free) ou Supabase (free) |
| ORM | Prisma |
| Auth | JWT (jose) + bcryptjs — sem Auth0 |
| Storage | Supabase Storage (gratuito) |
| Email | Nodemailer SMTP (Gmail/Outlook) |
| IA | Ollama (local) ou OpenRouter (free tier) — plug-ável via `AIProvider` |
| Deploy | Vercel (free tier) |

## Deploy no Vercel (5 minutos)

1. Fork este repositório
2. Crie um banco no [Neon](https://neon.tech) ou [Supabase](https://supabase.com) (free)
3. No Vercel → Import Project → selecione o fork
4. Configure as variáveis de ambiente (copie de `.env.example`)
5. Clique em **Deploy**

## Variáveis de ambiente obrigatórias

```
DATABASE_URL=       # Neon ou Supabase connection string
JWT_SECRET=         # string aleatória longa
REFRESH_TOKEN_SECRET=
```

## Rodando localmente

```bash
npm install
npm run db:push     # aplica o schema no banco
npm run dev
```

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário autenticado |
| GET/POST | `/api/jobs` | Listar / criar vagas |
| GET/PATCH/DELETE | `/api/jobs/[id]` | Detalhe / editar / deletar vaga |
| GET/POST | `/api/candidates` | Listar / criar candidatos |
| POST | `/api/candidates/[id]/upload-resume` | Upload + parsing de currículo |
| GET/POST | `/api/applications` | Listar / criar candidaturas |
| PATCH | `/api/applications/[id]/move` | Mover etapa (kanban) |
| POST | `/api/applications/[id]/feedback` | Adicionar feedback |
| POST | `/api/interviews` | Agendar entrevista |
| POST | `/api/ai/rank` | Ranquear candidatos com IA |
| GET | `/api/dashboard/stats` | Métricas do dashboard |

## IA — troca de provedor

Edite a variável `AI_PROVIDER` no `.env`:

- `ollama` → Ollama local (padrão) — ideal para dev
- `openrouter` → [OpenRouter](https://openrouter.ai) free tier — ideal para produção no Vercel
