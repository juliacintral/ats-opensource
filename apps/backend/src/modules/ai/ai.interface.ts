export interface AIProvider {
  /** Geração de texto livre */
  generate(prompt: string): Promise<string>;
  /** Sumarização de texto longo */
  summarize(text: string): Promise<string>;
  /** Parsing de currículo bruto → JSON estruturado */
  parseResume(resumeText: string): Promise<Record<string, any>>;
  /** Ranking de candidato para uma vaga → score + justificativa */
  rankCandidate(candidateProfile: string, jobDescription: string): Promise<{ score: number; justification: string }>;
}
