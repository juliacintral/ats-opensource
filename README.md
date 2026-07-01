# 🎯 ATS Open Source

Sistema de Recrutamento (ATS) open source inspirado no Greenhouse. Construído com Next.js, NestJS, PostgreSQL e IA local via Ollama.

---

## 🚀 Guia Completo — Do Zero ao Funcionando

> Siga os passos na ordem. Cada passo tem um link direto para onde você precisa ir.

---

## Passo 1 — Instalar o Node.js

Você precisa do Node.js instalado no computador.

1. Acesse 👉 **https://nodejs.org**
2. Clique no botão verde **"LTS"** (versão recomendada)
3. Baixe e instale normalmente (next, next, finish)
4. Para confirmar que funcionou, abra o terminal e digite:
   ```
   node -v
   ```
   Deve aparecer algo como `v20.x.x`

> **Onde abrir o terminal?**
> - Windows: aperta `Win + R`, digita `cmd`, aperta Enter
> - Mac: aperta `Cmd + Espaço`, digita `Terminal`, aperta Enter

---

## Passo 2 — Instalar o Git

1. Acesse 👉 **https://git-scm.com/downloads**
2. Baixe para o seu sistema operacional
3. Instale com as opções padrão
4. Para confirmar:
   ```
   git -v
   ```

---

## Passo 3 — Baixar o projeto

No terminal, escolha uma pasta onde quer salvar o projeto (ex: Documentos) e rode:

```bash
git clone https://github.com/juliacintral/ats-opensource
cd ats-opensource
```

Agora você tem o projeto na sua máquina.

---

## Passo 4 — Criar o banco de dados (gratuito, online)

Você vai usar o **Neon** — banco PostgreSQL gratuito na nuvem, sem instalar nada.

1. Acesse 👉 **https://neon.tech**
2. Clique em **"Sign up"** e crie uma conta (pode usar o Google)
3. Clique em **"Create a project"**
4. Dê um nome (ex: `ats-db`) e clique em **Create**
5. Na próxima tela, você vai ver uma **Connection String** assim:
   ```
   postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
6. **Copie essa string** — você vai usar no próximo passo

---

## Passo 5 — Configurar o backend

No terminal:

```bash
cd apps/backend
```

Agora crie o arquivo de configuração:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Abra o arquivo `.env` no bloco de notas (ou qualquer editor) e substitua:

```env
DATABASE_URL="cole-aqui-a-connection-string-do-neon"
DIRECT_URL="cole-aqui-a-mesma-connection-string-do-neon"

JWT_SECRET="qualquer-texto-longo-aqui-ex-minha-chave-super-secreta-123"
REFRESH_TOKEN_SECRET="outro-texto-longo-diferente-aqui-456"

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Salve o arquivo.

---

## Passo 6 — Instalar as dependências e criar as tabelas

Ainda na pasta `apps/backend`, rode um comando de cada vez:

```bash
npm install
```
_(aguarde terminar — pode demorar 1-2 minutos)_

```bash
npx prisma migrate dev --name init
```
_(isso cria todas as tabelas no banco que você criou no Neon)_

```bash
npx prisma db seed
```
_(isso cria usuários e uma vaga de exemplo para você testar)_

---

## Passo 7 — Rodar o backend

```bash
npm run start:dev
```

Você deve ver no terminal:
```
Backend rodando na porta 3001
```

✅ **Backend funcionando!** Deixe esse terminal aberto.

---

## Passo 8 — Configurar e rodar o frontend

Abra um **novo terminal** (sem fechar o anterior) e navegue até a pasta do frontend:

```bash
cd apps/frontend
```

Crie o arquivo de configuração:

**Windows:**
```bash
copy .env.example .env.local
```

**Mac/Linux:**
```bash
cp .env.example .env.local
```

O conteúdo já está correto (aponta para `localhost:3001`). Não precisa mudar nada.

Agora instale e rode:

```bash
npm install
npm run dev
```

Você deve ver:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

✅ **Frontend funcionando!**

---

## Passo 9 — Acessar o sistema

Abra o navegador e acesse 👉 **http://localhost:3000**

Faça login com:
- **Email:** `admin@ats.com`
- **Senha:** `admin123`

---

## ✅ Resumo dos comandos

### Terminal 1 — Backend
```bash
git clone https://github.com/juliacintral/ats-opensource
cd ats-opensource/apps/backend
cp .env.example .env          # edite com sua DATABASE_URL do Neon
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### Terminal 2 — Frontend
```bash
cd ats-opensource/apps/frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 🆘 Problemas comuns

### "command not found: npm"
Node.js não foi instalado corretamente. Reinstale pelo link do Passo 1.

### "Error: Can't reach database server"
A `DATABASE_URL` no arquivo `.env` está errada. Volte ao Neon, copie a connection string novamente e cole no `.env`.

### "Port 3001 already in use"
Algum outro processo está usando a porta. Troque `PORT=3001` para `PORT=3002` no `.env` e mude `NEXT_PUBLIC_API_URL=http://localhost:3002/api` no `.env.local`.

### A página abre mas dá erro ao fazer login
Verifique se o Terminal 1 (backend) ainda está rodando. Se tiver fechado, abra novamente e rode `npm run start:dev`.

---

## 📦 Stack utilizada

| Camada | Tecnologia | Custo |
|---|---|---|
| Frontend | Next.js 14 + React + Tailwind | Gratuito |
| Backend | NestJS + TypeScript | Gratuito |
| Banco de dados | PostgreSQL via Neon | Gratuito |
| ORM | Prisma | Gratuito |
| Autenticação | JWT próprio (sem Auth0) | Gratuito |
| IA (futuro) | Ollama + Qwen3/Llama3 | Gratuito |

---

## 🌐 Deploy (quando quiser colocar online)

### Frontend → Vercel (gratuito)
1. Acesse 👉 **https://vercel.com**
2. Conecte com sua conta do GitHub
3. Importe o repositório `ats-opensource`
4. Configure o **Root Directory** como `apps/frontend`
5. Adicione a variável de ambiente: `NEXT_PUBLIC_API_URL` = URL do seu backend
6. Clique em Deploy

### Backend → Railway (gratuito nos primeiros meses)
1. Acesse 👉 **https://railway.app**
2. Conecte com GitHub
3. New Project → Deploy from GitHub repo
4. Selecione `ats-opensource`, configure Root Directory como `apps/backend`
5. Adicione as variáveis de ambiente do arquivo `.env`
6. Deploy
