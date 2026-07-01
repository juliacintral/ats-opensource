export interface AIProvider {
  generate(prompt: string): Promise<string>
  summarize(text: string): Promise<string>
  parseResume(text: string): Promise<Record<string, unknown>>
  rankCandidates(job: string, candidates: string[]): Promise<number[]>
}

// ─── Ollama (local) ──────────────────────────────────────────────────────────
class OllamaProvider implements AIProvider {
  private baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  private model = process.env.OLLAMA_MODEL ?? 'qwen3:latest'

  async generate(prompt: string) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    })
    const data = await res.json()
    return data.response as string
  }

  async summarize(text: string) {
    return this.generate(`Summarize the following candidate resume in 3 bullet points:\n\n${text}`)
  }

  async parseResume(text: string) {
    const raw = await this.generate(
      `Extract structured information from this resume. Return ONLY valid JSON with keys: name, email, phone, skills (array), experience (array of {company, title, years}), education (array of {institution, degree, year}).\n\nResume:\n${text}`
    )
    try {
      const match = raw.match(/\{[\s\S]+\}/)
      return match ? JSON.parse(match[0]) : {}
    } catch {
      return {}
    }
  }

  async rankCandidates(job: string, candidates: string[]) {
    const scores: number[] = []
    for (const cv of candidates) {
      const raw = await this.generate(
        `Rate how well this candidate fits the job. Return ONLY a number from 0 to 100.\n\nJob: ${job}\n\nCandidate: ${cv}`
      )
      scores.push(parseInt(raw.replace(/\D/g, '')) || 0)
    }
    return scores
  }
}

// ─── OpenRouter (free tier) ──────────────────────────────────────────────────
class OpenRouterProvider implements AIProvider {
  private apiKey = process.env.OPENROUTER_API_KEY ?? ''
  private model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3-8b-instruct:free'

  private async chat(content: string) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content }],
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content as string ?? ''
  }

  async generate(prompt: string) { return this.chat(prompt) }
  async summarize(text: string) {
    return this.chat(`Summarize this resume in 3 bullet points:\n\n${text}`)
  }
  async parseResume(text: string) {
    const raw = await this.chat(
      `Extract structured info from this resume. Return ONLY valid JSON with keys: name, email, phone, skills (array), experience, education.\n\n${text}`
    )
    try { return JSON.parse(raw.match(/\{[\s\S]+\}/)?.[0] ?? '{}') } catch { return {} }
  }
  async rankCandidates(job: string, candidates: string[]) {
    const scores: number[] = []
    for (const cv of candidates) {
      const raw = await this.chat(`Rate 0-100 fit for job. Return ONLY a number.\nJob: ${job}\nCandidate: ${cv}`)
      scores.push(parseInt(raw.replace(/\D/g, '')) || 0)
    }
    return scores
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? 'ollama'
  if (provider === 'openrouter') return new OpenRouterProvider()
  return new OllamaProvider()
}
