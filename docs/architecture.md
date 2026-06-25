# Arquitetura do ATS Enterprise

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    Clientes                              │
│  Recruiter UI   Hiring Manager   Candidate Portal        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│              NestJS Backend (Monólito Modular)           │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth   │ │   Jobs   │ │Candidates│ │  AI/LLM   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │Interviews│ │Feedbacks │ │  Email   │ │  Storage  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                                                          │
│  ┌──────────────┐   ┌─────────────┐                     │
│  │ Prisma ORM   │   │ Bull Queues │                     │
│  └──────┬───────┘   └──────┬──────┘                     │
└─────────│────────────────── │────────────────────────────┘
          │                   │
┌─────────▼──────┐  ┌────────▼──────┐  ┌────────────────┐
│  PostgreSQL     │  │    Redis      │  │  Ollama (IA)   │
│  (Supabase/     │  │  (cache+jobs) │  │  Qwen3/Llama3  │
│   Neon/Docker)  │  │               │  │  (local/docker)│
└─────────────────┘  └───────────────┘  └────────────────┘
```

## Módulos do Backend

| Módulo | Responsabilidade |
|---|---|
| `AuthModule` | JWT, refresh tokens, bcrypt, guards |
| `UsersModule` | CRUD de usuários, roles |
| `JobsModule` | Criação e gestão de vagas, pipeline |
| `CandidatesModule` | Perfis, upload/parse de currículo |
| `ApplicationsModule` | Candidaturas, kanban de stages |
| `InterviewsModule` | Agendamento, integração Meet/Teams |
| `FeedbackModule` | Scorecards, decisões colaborativas |
| `AIModule` | Abstração plugável de provedores LLM |
| `EmailModule` | Notificações via SMTP/Brevo |
| `StorageModule` | Upload p/ Supabase Storage ou MinIO |

## Decisões Arquiteturais

### Por que Monólito Modular?

- **Simplicidade operacional** — 1 processo, 1 container, sem service mesh
- **Deploy gratuito** — Railway, Render, VPS básica
- **Migrável para microserviços** — cada módulo já tem fronteiras claras
- **Time pequeno** — microserviços exigem infraestrutura e maturidade de time

### Por que PostgreSQL em vez de ElasticSearch?

- ElasticSearch consome 1-2GB RAM apenas para iniciar
- PostgreSQL Full Text Search (`tsvector`/`tsquery`) cobre 90% dos casos
- Se precisar de busca mais avançada: Meilisearch (self-hosted, ~50MB RAM)

### Por que IA plugável?

- Evita lock-in em qualquer provedor pago
- Desenvolvimento/MVP: Ollama local (custo zero)
- Produção light: OpenRouter free tier
- Produção heavy: adicione Anthropic/OpenAI sem mudar nenhum módulo
