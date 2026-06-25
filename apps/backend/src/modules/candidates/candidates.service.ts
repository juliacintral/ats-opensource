import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService
  ) {}

  async processResume(candidateId: string, fileBuffer: Buffer, mimeType: string) {
    let text = '';

    if (mimeType === 'application/pdf') {
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text;
    } else {
      text = fileBuffer.toString('utf-8');
    }

    const [parsedResume, aiSummary] = await Promise.all([
      this.ai.parseResume(text),
      this.ai.summarizeCandidate(text),
    ]);

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { resumeText: text, parsedResume, aiSummary },
    });

    return { parsedResume, aiSummary };
  }

  async search(query: string) {
    // PostgreSQL Full Text Search — sem ElasticSearch
    return this.prisma.$queryRaw`
      SELECT id, name, email, "aiSummary", "resumeText",
             ts_rank(to_tsvector('portuguese', COALESCE("resumeText", '') || ' ' || name || ' ' || email),
                     plainto_tsquery('portuguese', ${query})) AS rank
      FROM candidates
      WHERE to_tsvector('portuguese', COALESCE("resumeText", '') || ' ' || name || ' ' || email)
            @@ plainto_tsquery('portuguese', ${query})
      ORDER BY rank DESC
      LIMIT 20
    `;
  }

  async rankForJob(candidateId: string, jobId: string) {
    const [candidate, job] = await Promise.all([
      this.prisma.candidate.findUnique({ where: { id: candidateId } }),
      this.prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!candidate || !job) throw new Error('Candidato ou vaga não encontrada');

    const profile = `Nome: ${candidate.name}\nResumo IA: ${candidate.aiSummary}\nTexto do currículo: ${candidate.resumeText?.slice(0, 2000)}`;
    const jobDesc = `${job.title}\n${job.description}\nRequisitos: ${job.requirements}`;

    return this.ai.rankCandidate(profile, jobDesc);
  }

  async findAll() {
    return this.prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    return this.prisma.candidate.findUnique({
      where: { id },
      include: { applications: { include: { job: true, stage: true } } },
    });
  }
}
