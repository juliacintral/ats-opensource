import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AIProvider, ParsedResume, CandidateRanking } from '../ai.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly host: string;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.host = config.get('OLLAMA_HOST', 'http://localhost:11434');
    this.model = config.get('OLLAMA_MODEL', 'qwen3');
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    const { data } = await axios.post(`${this.host}/api/chat`, {
      model: this.model,
      messages,
      stream: false,
    });

    return data.message.content;
  }

  async summarize(text: string): Promise<string> {
    return this.generate(
      `Resuma o seguinte texto em 3-5 frases objetivas, destacando pontos principais:\n\n${text}`,
      'Você é um assistente especializado em RH. Seja objetivo e profissional.'
    );
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    const systemPrompt = `Você é um parser de currículos. Extraia as informações e retorne APENAS JSON válido, sem markdown.`;
    const prompt = `Extraia as informações do currículo abaixo em JSON com os campos:
{
  "name": string,
  "email": string,
  "phone": string,
  "summary": string,
  "skills": string[],
  "experience": [{"company": string, "role": string, "startDate": string, "endDate": string, "description": string}],
  "education": [{"institution": string, "degree": string, "field": string, "year": string}],
  "languages": string[],
  "certifications": string[]
}

Currículo:
${resumeText}`;

    const raw = await this.generate(prompt, systemPrompt);
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] || raw);
    } catch {
      this.logger.warn('Falha ao parsear JSON do currículo, retornando estrutura vazia');
      return { skills: [], experience: [], education: [], languages: [], certifications: [] };
    }
  }

  async rankCandidate(
    candidateProfile: string,
    jobDescription: string
  ): Promise<CandidateRanking> {
    const systemPrompt = `Você é um especialista em recrutamento. Avalie candidatos e retorne APENAS JSON válido.`;
    const prompt = `Avalie o candidato para a vaga e retorne JSON:
{
  "score": number (0-100),
  "reasoning": string,
  "strengths": string[],
  "gaps": string[]
}

Vaga:\n${jobDescription}\n\nCandidato:\n${candidateProfile}`;

    const raw = await this.generate(prompt, systemPrompt);
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] || raw);
    } catch {
      return { score: 0, reasoning: 'Erro ao avaliar', strengths: [], gaps: [] };
    }
  }
}
