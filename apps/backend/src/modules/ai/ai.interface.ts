export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  education: {
    institution: string;
    degree?: string;
    field?: string;
    year?: string;
  }[];
  languages: string[];
  certifications: string[];
}

export interface CandidateRanking {
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  gaps: string[];
}

/**
 * Interface principal do provedor de IA.
 * Troque a implementação sem mudar nenhum outro módulo.
 * Provedores disponíveis: OllamaProvider, OpenRouterProvider, LMStudioProvider
 */
export interface AIProvider {
  /**
   * Gera texto livre.
   */
  generate(prompt: string, systemPrompt?: string): Promise<string>;

  /**
   * Resume um texto longo.
   */
  summarize(text: string): Promise<string>;

  /**
   * Extrai dados estruturados de um currículo em texto.
   */
  parseResume(resumeText: string): Promise<ParsedResume>;

  /**
   * Rankeia um candidato para uma vaga e retorna score + reasoning.
   */
  rankCandidate(
    candidateProfile: string,
    jobDescription: string
  ): Promise<CandidateRanking>;
}
