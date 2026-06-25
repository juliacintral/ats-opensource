import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  async create(dto: CreateCandidateDto) {
    return this.prisma.candidate.create({ data: dto });
  }

  async findAll(search?: string) {
    if (search) {
      return this.prisma.$queryRaw`
        SELECT
          id, name, email, phone,
          "linkedinUrl", "githubUrl", "portfolioUrl",
          "resumeUrl", "aiSummary", source,
          "createdAt", "updatedAt",
          ts_rank(
            to_tsvector('portuguese',
              COALESCE("resumeText", '') || ' ' || name || ' ' || email
            ),
            plainto_tsquery('portuguese', ${search})
          ) AS rank
        FROM candidates
        WHERE
          to_tsvector('portuguese',
            COALESCE("resumeText", '') || ' ' || name || ' ' || email
          ) @@ plainto_tsquery('portuguese', ${search})
        ORDER BY rank DESC
        LIMIT 30
      `;
    }
    return this.prisma.candidate.findMany({
      select: {
        id: true, name: true, email: true, phone: true,
        linkedinUrl: true, githubUrl: true, portfolioUrl: true,
        resumeUrl: true, aiSummary: true, source: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: { select: { id: true, title: true, status: true } },
            stage: true,
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });
    if (!candidate) throw new NotFoundException('Candidato não encontrado');
    return candidate;
  }

  async update(id: string, dto: UpdateCandidateDto) {
    await this.findOne(id);
    return this.prisma.candidate.update({ where: { id }, data: dto });
  }

  async processResume(candidateId: string, fileBuffer: Buffer, mimeType: string, fileUrl: string) {
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

    return this.prisma.candidate.update({
      where: { id: candidateId },
      data: { resumeText: text, parsedResume, aiSummary, resumeUrl: fileUrl },
      select: { id: true, name: true, aiSummary: true, parsedResume: true },
    });
  }

  async rankForJob(candidateId: string, jobId: string) {
    const [candidate, job] = await Promise.all([
      this.prisma.candidate.findUnique({ where: { id: candidateId } }),
      this.prisma.job.findUnique({ where: { id: jobId } }),
    ]);
    if (!candidate) throw new NotFoundException('Candidato não encontrado');
    if (!job) throw new NotFoundException('Vaga não encontrada');

    const profile = `Nome: ${candidate.name}\nEmail: ${candidate.email}\nResumo: ${candidate.aiSummary ?? ''}\nCurrículo: ${(candidate.resumeText ?? '').slice(0, 3000)}`;
    const jobDesc = `Título: ${job.title}\n\nDescrição:\n${job.description}\n\nRequisitos:\n${job.requirements ?? ''}`;

    const ranking = await this.ai.rankCandidate(profile, jobDesc);

    await this.prisma.application.updateMany({
      where: { candidateId, jobId },
      data: { aiScore: ranking.score },
    });

    return ranking;
  }
}
