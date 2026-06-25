# Provedores de IA

O sistema usa uma interface plugável (`AIProvider`) que permite trocar o provedor sem alterar nenhum módulo consumidor.

## Configuração

Defina `AI_PROVIDER` no `.env`:

```bash
# Ollama (padrão — gratuito, local)
AI_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3

# OpenRouter (gratuito, remoto)
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free
```

## Configurando Ollama

```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo (escolha um)
ollama pull qwen3          # Recomendado — excelente em PT-BR, ~4GB
ollama pull llama3         # Meta, muito bom, ~4GB
ollama pull mistral        # Rápido, ~4GB
ollama pull deepseek-r1:8b # Raciocínio, ~5GB

# Verificar se está rodando
curl http://localhost:11434/api/tags
```

## Adicionando Novo Provedor

1. Crie `src/modules/ai/providers/meu-provider.provider.ts`
2. Implemente a interface `AIProvider`
3. Registre em `ai.module.ts`
4. Adicione o case no factory

```typescript
// Exemplo mínimo
@Injectable()
export class MeuProvider implements AIProvider {
  async generate(prompt: string): Promise<string> { ... }
  async summarize(text: string): Promise<string> { ... }
  async parseResume(text: string): Promise<ParsedResume> { ... }
  async rankCandidate(profile: string, job: string): Promise<CandidateRanking> { ... }
}
```

## Modelos Gratuitos Recomendados

| Modelo | Provedor | RAM | Destaque |
|---|---|---|---|
| Qwen3:8b | Ollama | 6GB | Melhor para PT-BR |
| Llama 3.1:8b | Ollama | 6GB | Geral, muito capaz |
| Mistral:7b | Ollama | 5GB | Rápido e eficiente |
| DeepSeek-R1:8b | Ollama | 6GB | Raciocínio estruturado |
| llama-3-8b-instruct:free | OpenRouter | — | Gratuito remoto |
| mistral-7b-instruct:free | OpenRouter | — | Gratuito remoto |
