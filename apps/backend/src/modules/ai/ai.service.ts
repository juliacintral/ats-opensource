import { Inject, Injectable } from '@nestjs/common';
import { AIProvider, ParsedResume, CandidateRanking } from './ai.interface';

@Injectable()
export class AIService {
  constructor(@Inject('AI_PROVIDER') private readonly ai: AIProvider) {}

  async parseResume(text: string): Promise<ParsedResume> {
    return this.ai.parseResume(text);
  }

  async summarizeCandidate(profileText: string): Promise<string> {
    return this.ai.summarize(profileText);
  }

  async rankCandidate(
    candidateProfile: string,
    jobDescription: string
  ): Promise<CandidateRanking> {
    return this.ai.rankCandidate(candidateProfile, jobDescription);
  }

  async generateJobDescription(title: string, requirements: string): Promise<string> {
    return this.ai.generate(
      `Crie uma descrição de vaga completa e atrativa para: ${title}\nRequisitos: ${requirements}`,
      'Você é um especialista em recrutamento. Crie descrições de vagas claras, inclusivas e atrativas.'
    );
  }
}
