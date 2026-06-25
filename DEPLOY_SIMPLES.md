# Deploy Simples — 4 variáveis, 2 projetos Vercel

## Variáveis do Backend (apps/backend)

| Nome | Valor |
|---|---|
| `DATABASE_URL` | Connection string do Supabase |
| `JWT_SECRET` | Qualquer texto longo |
| `REFRESH_TOKEN_SECRET` | Outro texto longo |
| `FRONTEND_URL` | URL do frontend no Vercel |

## Variáveis do Frontend (apps/frontend)

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend no Vercel |

## Como pegar o DATABASE_URL no Supabase

1. Acesse https://supabase.com e crie conta
2. New Project → dê um nome, senha forte, região South America
3. Aguarde ~2 minutos
4. Vá em: Settings → Database → Connection string → aba URI
5. Troque [YOUR-PASSWORD] pela sua senha
6. Adicione no final: ?pgbouncer=true&connection_limit=1

Exemplo:
postgresql://postgres:SuaSenha@db.abcdefgh.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
