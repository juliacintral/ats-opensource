import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async apply(jobId: string, candidateId: string) {
    const exists = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });
    if (exists) throw new ConflictException('Candidato já aplicou para esta vaga');

    const [job, firstStage] = await Promise.all([
      this.prisma.job.findUnique({ where: { id: jobId } }),
      this.prisma.stage.findFirst({ where: { jobId }, orderBy: { order: 'asc' } }),
    ]);

    const application = await this.prisma.application.create({
      data: { jobId, candidateId, stageId: firstStage?.id ?? null },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        stage: true,
      },
    });

    // Dispara e-mail assíncrono sem bloquear resposta
    if (application.candidate?.email && job) {
      this.email.sendApplicationReceived(
        application.candidate.email,
        application.candidate.name,
        job.title,
      ).catch(() => {});
    }

    return application;
  }

  async findByJob(jobId: string, stageId?: string) {
    return this.prisma.application.findMany({
      where: { jobId, ...(stageId ? { stageId } : {}) },
      include: {
        candidate: true,
        stage: true,
        feedbacks: { include: { author: { select: { id: true, name: true } } } },
        _count: { select: { interviews: true, feedbacks: true } },
      },
      orderBy: [{ aiScore: 'desc' }, { appliedAt: 'asc' }],
    });
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.application.findMany({
      where: { candidateId },
      include: {
        job: { select: { id: true, title: true, status: true } },
        stage: true,
        _count: { select: { interviews: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: { include: { pipeline: { orderBy: { order: 'asc' } } } },
        stage: true,
        interviews: {
          include: { interviewer: { select: { id: true, name: true } } },
          orderBy: { scheduledAt: 'asc' },
        },
        feedbacks: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!app) throw new NotFoundException('Candidatura não encontrada');
    return app;
  }

  async moveStage(applicationId: string, stageId: string) {
    const app = await this.prisma.application.update({
      where: { id: applicationId },
      data: { stageId },
      include: {
        stage: true,
        candidate: { select: { email: true, name: true } },
        job: { select: { title: true } },
      },
    });
    // Notifica candidato sobre avanço de estágio
    if (app.candidate?.email && app.stage) {
      this.email.sendStageAdvanced(
        app.candidate.email,
        app.candidate.name,
        app.job.title,
        app.stage.name,
      ).catch(() => {});
    }
    return app;
  }

  async updateStatus(applicationId: string, status: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: status as any },
    });
  }

  async addNote(applicationId: string, notes: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { notes },
    });
  }
}
