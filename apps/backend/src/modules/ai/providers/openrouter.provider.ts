import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AIProvider, ParsedResume, CandidateRanking } from '../ai.interface';
import { OllamaProvider } from './ollama.provider';

/**
 * OpenRouter — acesso a modelos gratuitos remotamente.
 * Modelos gratuitos disponíveis em: https://openrouter.ai/models?q=free
 * Ex: meta-llama/llama-3-8b-instruct:free, mistralai/mistral-7b-instruct:free
 */
@Injectable()
export class OpenRouterProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseURL = 'https://openrouter.ai/api/v1';

  constructor(private config: ConfigService) {
    this.apiKey = config.get('OPENROUTER_API_KEY', '');
    this.model = config.get(
      'OPENROUTER_MODEL',
      'meta-llama/llama-3-8b-instruct:free'
    );
  }

  private async chat(messages: { role: string; content: string }[]): Promise<string> {
    const { data } = await axios.post(
      `${this.baseURL}/chat/completions`,
      { model: this.model, messages },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/juliacintral/ats-opensource',
          'X-Title': 'ATS Enterprise',
        },
      }
    );
    return data.choices[0].message.content;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];
    return this.chat(messages);
  }

  // Reutiliza a lógica de prompt do OllamaProvider via herança de responsabilidade
  async summarize(text: string): Promise<string> {
    return this.generate(
      `Resuma em 3-5 frases objetivas:\n\n${text}`,
      'Você é um assistente de RH. Seja objetivo.'
    );
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    // Mesma lógica do Ollama — o prompt é idêntico
    const ollamaLike = new OllamaProvider(this.config);
    ollamaLike['generate'] = this.generate.bind(this);
    return ollamaLike.parseResume(resumeText);
  }

  async rankCandidate(candidateProfile: string, jobDescription: string): Promise<CandidateRanking> {
    const ollamaLike = new OllamaProvider(this.config);
    ollamaLike['generate'] = this.generate.bind(this);
    return ollamaLike.rankCandidate(candidateProfile, jobDescription);
  }
}
