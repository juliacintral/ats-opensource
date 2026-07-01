import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findByJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: { candidate: true, currentStage: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: { candidateId: string; jobId: string; stageId: string }) {
    return this.prisma.application.create({
      data: { candidateId: data.candidateId, jobId: data.jobId, currentStageId: data.stageId, status: 'ACTIVE' },
      include: { candidate: true, currentStage: true },
    });
  }

  moveStage(id: string, stageId: string) {
    return this.prisma.application.update({
      where: { id },
      data: { currentStageId: stageId },
      include: { candidate: true, currentStage: true },
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.application.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
