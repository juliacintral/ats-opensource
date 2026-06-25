import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../ai.interface';

@Injectable()
export class OpenRouterProvider implements AIProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private apiKey: string;
  private model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENROUTER_API_KEY', '');
    this.model = config.get<string>('OPENROUTER_MODEL', 'meta-llama/llama-3-8b-instruct:free');
  }

  private async chat(userMessage: string): Promise<string> {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'ATS Open Source',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  generate(prompt: string) { return this.chat(prompt); }

  summarize(text: string) {
    return this.chat(
      `Resuma o currículo em 3-5 frases destacando experiências, habilidades e diferenciais. Seja objetivo.\n\nCURRÍCULO:\n${text.slice(0, 4000)}\n\nRESUMO:`
    );
  }

  async parseResume(resumeText: string): Promise<Record<string, any>> {
    const raw = await this.chat(
      `Extraia do currículo e retorne APENAS JSON válido com: name, email, phone, location, linkedin, github, summary, skills[], languages[], experience[], education[], certifications[].\n\nCURRÍCULO:\n${resumeText.slice(0, 5000)}`
    );
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      return { raw };
    }
  }

  async rankCandidate(profile: string, jobDescription: string): Promise<{ score: number; justification: string }> {
    const raw = await this.chat(
      `Avalie o candidato para a vaga. Retorne APENAS JSON: { "score": <0-100>, "justification": "<2-3 frases>" }\n\nVAGA:\n${jobDescription.slice(0, 2000)}\n\nCANDIDATO:\n${profile.slice(0, 2000)}`
    );
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* fallback */ }
    return { score: 0, justification: 'Score indisponível.' };
  }
}
