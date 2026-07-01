import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AIService } from '../ai/ai.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private aiService: AIService,
  ) {}

  async create(dto: CreateCandidateDto) {
    return this.prisma.candidate.create({ data: dto as any });
  }

  async findAll(search?: string) {
    if (search) {
      return this.prisma.candidate.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true, name: true, email: true, phone: true,
          linkedin: true, linkedinUrl: true, githubUrl: true, portfolioUrl: true,
          skills: true, resumeUrl: true, aiSummary: true,
          createdAt: true,
        },
      });
    }
    return this.prisma.candidate.findMany({
      select: {
        id: true, name: true, email: true, phone: true,
        linkedin: true, linkedinUrl: true, githubUrl: true, portfolioUrl: true,
        skills: true, resumeUrl: true, aiSummary: true,
        createdAt: true,
      },
      include: {
        applications: {
          include: { currentStage: true },
          orderBy: { appliedAt: 'desc' },
          take: 3,
        },
      } as any,
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: { job: true, currentStage: true },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });
    if (!c) throw new NotFoundException('Candidato não encontrado');
    return c;
  }

  async uploadResume(candidateId: string, file: Express.Multer.File) {
    const fileUrl = await this.storageService.upload(file, `resumes/${candidateId}`);
    let text = '';
    try {
      const parsed = await pdfParse(file.buffer);
      text = parsed.text;
    } catch {}

    let parsedResume: any = null;
    let aiSummary = '';
    try {
      parsedResume = await this.aiService.parseResume(text);
      aiSummary = await this.aiService.summarize(text);
    } catch {}

    return this.prisma.candidate.update({
      where: { id: candidateId },
      data: { resumeText: text, parsedResume, aiSummary, resumeUrl: fileUrl },
      select: { id: true, name: true, aiSummary: true, parsedResume: true },
    });
  }

  async rankForJob(candidateId: string, jobId: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!candidate || !job) throw new NotFoundException('Candidato ou vaga não encontrado');

    const profile = `Nome: ${candidate.name}\nEmail: ${candidate.email}\nResumo: ${(candidate as any).aiSummary ?? ''}\nCurrículo: ${((candidate as any).resumeText ?? '').slice(0, 3000)}`;
    const jobDesc = `Título: ${job.title}\n\nDescrição:\n${job.description}\n\nRequisitos:\n${(job as any).requirements ?? ''}`;

    const ranking = await this.aiService.rankCandidates(profile, jobDesc);
    await this.prisma.application.updateMany({
      where: { candidateId, jobId },
      data: { aiScore: ranking.score },
    });
    return ranking;
  }
}
