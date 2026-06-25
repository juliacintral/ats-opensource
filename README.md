# 🚀 ATS Enterprise Open Source

> Sistema de rastreamento de candidatos (ATS) semelhante ao Greenhouse, construído com tecnologias 100% gratuitas e open source. Self-hosted, custo próximo de zero no MVP.

---

## 🗂️ Estrutura do Monorepo

```
ats-opensource/
├── apps/
│   ├── frontend/          # Next.js 14 + TypeScript + Tailwind + Shadcn UI
│   └── backend/           # NestJS + TypeScript + Prisma + PostgreSQL
├── packages/
│   └── shared/            # Tipos e utilitários compartilhados
├── docker/
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── docs/
│   ├── architecture.md
│   ├── ai-providers.md
│   └── deployment.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

## ⚡ Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework principal (App Router) |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Shadcn UI | Componentes UI |
| React Query | Cache e fetching de dados |
| Zustand | Estado global |

### Backend
| Tecnologia | Uso |
|---|---|
| NestJS | Framework backend modular |
| TypeScript | Tipagem estática |
| Prisma ORM | Acesso ao banco de dados |
| PostgreSQL | Banco de dados principal |
| Redis | Cache e filas de jobs |
| JWT + Bcrypt | Autenticação própria |

### IA (plugável)
| Provedor | Custo | Como usar |
|---|---|---|
| Ollama + Llama 3 / Qwen3 | Gratuito (local) | `OLLAMA_HOST=http://localhost:11434` |
| OpenRouter free models | Gratuito (remoto) | `AI_PROVIDER=openrouter` |
| LM Studio | Gratuito (local) | `AI_PROVIDER=lmstudio` |

### Infraestrutura Gratuita
| Serviço | Gratuito |
|---|---|
| Vercel / Cloudflare Pages | Frontend |
| Railway (créditos) / VPS Docker | Backend |
| Supabase Free / Neon Free | PostgreSQL |
| Supabase Storage / MinIO | Currículos |
| GitHub Actions | CI/CD |
| Brevo free tier / SMTP Gmail | E-mails |

---

## 🔑 Módulos do Sistema

- **Auth** — JWT, Refresh Token, Bcrypt, roles (admin, recruiter, hiring manager)
- **Jobs** — criação de vagas, pipeline de stages personalizável
- **Candidates** — perfis, upload de currículo, histórico de aplicações
- **Applications** — kanban de candidatos por vaga, drag-and-drop de stages
- **Interviews** — agendamento, integração Google Meet / Microsoft Teams
- **Feedback** — scorecard por entrevistador, decisão colaborativa
- **AI** — parsing de currículo, ranqueamento, resumo de candidato (via Ollama local)
- **Email** — notificações automáticas via SMTP/Brevo
- **Dashboard** — métricas de recrutamento (time-to-hire, source tracking, funil)
- **Analytics** — Metabase / Apache Superset integrado

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- [Ollama](https://ollama.ai) (para IA local)

### 1. Clone e instale

```bash
git clone https://github.com/juliacintral/ats-opensource.git
cd ats-opensource
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edite os arquivos .env conforme necessário
```

### 3. Suba a infraestrutura local

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Execute as migrations

```bash
cd apps/backend
npx prisma migrate dev
```

### 5. Baixe o modelo de IA (opcional)

```bash
ollama pull qwen3
# ou
ollama pull llama3
```

### 6. Inicie o desenvolvimento

```bash
# Na raiz do projeto
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 📄 Licença

MIT — livre para uso comercial e self-hosting.
