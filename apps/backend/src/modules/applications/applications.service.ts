import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async apply(jobId: string, candidateId: string) {
    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });
    if (existing) throw new ConflictException('Candidato já aplicou para esta vaga');

    const firstStage = await this.prisma.stage.findFirst({
      where: { jobId },
      orderBy: { order: 'asc' },
    });

    const application = await this.prisma.application.create({
      data: { jobId, candidateId, currentStageId: firstStage?.id ?? null },
      include: { candidate: true, job: true },
    });

    if (application.candidate?.email && application.job) {
      await this.emailService.sendApplicationConfirmation(
        application.candidate.email,
        application.candidate.name,
        application.job.title,
      );
    }
    return application;
  }

  async findByJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
        currentStage: true,
      },
      orderBy: [{ aiScore: 'desc' }, { appliedAt: 'asc' }],
    });
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.application.findMany({
      where: { candidateId },
      include: {
        job: { include: { pipeline: { orderBy: { order: 'asc' } } } },
        currentStage: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getKanban(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        pipeline: { orderBy: { order: 'asc' } },
        applications: {
          include: { candidate: true, currentStage: true },
        },
      },
    });
    if (!job) throw new NotFoundException('Vaga não encontrada');
    return job;
  }

  async moveStage(applicationId: string, stageId: string) {
    const app = await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentStageId: stageId },
      include: { candidate: true, job: true, currentStage: true },
    });

    if (app.candidate?.email && app.currentStage) {
      await this.emailService.sendStageUpdate(
        app.candidate.email,
        app.candidate.name,
        app.job.title,
        app.currentStage.name,
      );
    }
    return app;
  }

  async updateNotes(applicationId: string, notes: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { notes },
    });
  }

  async updateStatus(applicationId: string, status: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: status as any },
    });
  }
}
