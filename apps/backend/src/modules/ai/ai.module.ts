import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  providers: [
    OllamaProvider,
    OpenRouterProvider,
    {
      provide: 'AI_PROVIDER',
      useFactory: (config: ConfigService, ollama: OllamaProvider, openrouter: OpenRouterProvider) => {
        const provider = config.get('AI_PROVIDER', 'ollama');
        const providers = { ollama, openrouter };
        return providers[provider] || ollama;
      },
      inject: [ConfigService, OllamaProvider, OpenRouterProvider],
    },
    AIService,
  ],
  exports: [AIService],
})
export class AIModule {}
