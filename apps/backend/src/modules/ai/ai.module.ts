import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  providers: [AIService, OllamaProvider, OpenRouterProvider],
  exports: [AIService],
})
export class AIModule {}
