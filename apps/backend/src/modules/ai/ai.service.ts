import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

/**
 * AIService — fachada única para IA.
 * Troca de provedor via variável de ambiente AI_PROVIDER:
 *   ollama       → Ollama local (padrão)
 *   openrouter   → OpenRouter free tier
 */
@Injectable()
export class AIService implements AIProvider {
  private readonly logger = new Logger(AIService.name);
  private provider: AIProvider;

  constructor(
    config: ConfigService,
    ollama: OllamaProvider,
    openrouter: OpenRouterProvider,
  ) {
    const selected = config.get<string>('AI_PROVIDER', 'ollama');
    this.provider = selected === 'openrouter' ? openrouter : ollama;
    this.logger.log(`Provedor de IA: ${selected}`);
  }

  generate(prompt: string) { return this.provider.generate(prompt); }
  summarize(text: string) { return this.provider.summarize(text); }
  parseResume(resumeText: string) { return this.provider.parseResume(resumeText); }
  rankCandidate(profile: string, jobDesc: string) { return this.provider.rankCandidate(profile, jobDesc); }

  /** Atalho semântico usado por CandidatesService */
  summarizeCandidate(resumeText: string) { return this.provider.summarize(resumeText); }
}
