# ATS Open Source

Um ATS completo rodando 100% de graça, sem infraestrutura adicional. Construdo com Next.js 14 + Prisma + PostgreSQL e feito pra subir no Vercel em menos de 5 minutos.

A ideia foi simples: eu queria um sistema de rastreamento de candidatos que eu controlasse de ponta a ponta, sem pagar por licença nem depender de ferramenta de terceiro.

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

1. Fork esse repositório
2. Crie um banco no [Neon](https://neon.tech) ou [Supabase](https://supabase.com) (free)
3. No Vercel → Import Project → selecione o fork
4. Configure as variáveis de ambiente (copie de `.env.example`)
5. Clique em **Deploy**

## Variáveis obrigatórias

```
DATABASE_URL=          # Neon ou Supabase connection string
JWT_SECRET=            # string aleatória longa
REFRESH_TOKEN_SECRET=
```

## Rodando local

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

## Trocando o provedor de IA

Edite `AI_PROVIDER` no `.env`:

- `ollama` → Ollama local (padrão) — melhor pra dev
- `openrouter` → [OpenRouter](https://openrouter.ai) free tier — melhor pra produção no Vercel

---

Feito com ❤️ juliacintral
