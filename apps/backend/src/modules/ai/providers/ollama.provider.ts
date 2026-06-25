import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../ai.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private baseUrl: string;
  private model: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = config.get<string>('OLLAMA_MODEL', 'qwen3');
  }

  private async chat(prompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.response as string;
  }

  generate(prompt: string) { return this.chat(prompt); }

  summarize(text: string) {
    return this.chat(
      `Você é um especialista em RH. Resuma o seguinte currículo em 3-5 frases destacando experiências principais, habilidades técnicas e diferenciais. Seja objetivo.\n\nCURRÍCULO:\n${text.slice(0, 4000)}\n\nRESUMO:`
    );
  }

  async parseResume(resumeText: string): Promise<Record<string, any>> {
    const raw = await this.chat(
      `Extraia informações do currículo abaixo e retorne um JSON válido com os campos:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "github": string,
  "summary": string,
  "skills": string[],
  "languages": string[],
  "experience": [{"company":string, "role":string, "start":string, "end":string, "description":string}],
  "education": [{"institution":string, "degree":string, "field":string, "year":string}],
  "certifications": string[]
}

Retorne APENAS o JSON, sem texto adicional.

CURRÍCULO:\n${resumeText.slice(0, 5000)}`
    );
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      this.logger.warn('parseResume: JSON inválido retornado pela IA');
      return { raw };
    }
  }

  async rankCandidate(profile: string, jobDescription: string): Promise<{ score: number; justification: string }> {
    const raw = await this.chat(
      `Você é um recrutador sênior. Avalie o candidato para a vaga e retorne JSON:
{ "score": <número de 0 a 100>, "justification": "<explicação em 2-3 frases>" }

RETORNE APENAS O JSON.

VAGA:\n${jobDescription.slice(0, 2000)}\n\nCANDIDATO:\n${profile.slice(0, 2000)}`
    );
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* fallback */ }
    return { score: 0, justification: 'Não foi possível calcular score automaticamente.' };
  }
}
