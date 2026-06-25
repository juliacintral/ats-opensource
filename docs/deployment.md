# Guia de Deploy

## MVP Gratuito (Custo Zero)

| Componente | Serviço | Tier Gratuito |
|---|---|---|
| Frontend | Vercel | 100GB bandwidth/mês |
| Backend | Railway | $5 crédito/mês |
| Banco de dados | Supabase Free | 500MB PostgreSQL |
| Storage | Supabase Storage | 1GB |
| IA | Ollama local | Gratuito |
| Email | Gmail SMTP | 500/dia |
| CI/CD | GitHub Actions | 2000 min/mês |

## Self-Hosted (VPS Barata)

```bash
# VPS: ~$5/mês (DigitalOcean, Hetzner, Vultr)
# Requisitos: 2 vCPU, 4GB RAM, 40GB SSD

# 1. Clone o projeto na VPS
git clone https://github.com/juliacintral/ats-opensource
cd ats-opensource

# 2. Configure variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env

# 3. Suba tudo com Docker Compose
docker compose -f docker/docker-compose.prod.yml up -d

# 4. Execute as migrations
docker exec ats_backend npx prisma migrate deploy

# 5. Baixe o modelo de IA no container Ollama
docker exec ats_ollama ollama pull qwen3
```

## Deploy Frontend na Vercel

```bash
cd apps/frontend
npx vercel deploy
# Defina NEXT_PUBLIC_API_URL com a URL do seu backend
```

## Deploy Frontend no Cloudflare Pages

```bash
npx wrangler pages deploy apps/frontend/out
```

## Observabilidade Gratuita

```yaml
# Adicione ao docker-compose.prod.yml
  grafana:
    image: grafana/grafana:latest
    ports: ['3003:3000']
    volumes: [grafana_data:/var/lib/grafana]

  prometheus:
    image: prom/prometheus:latest
    ports: ['9090:9090']
    volumes: ['./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml']

  loki:
    image: grafana/loki:latest
    ports: ['3100:3100']
```
