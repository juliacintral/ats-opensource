import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { applicationId?: string; interviewerId?: string }) {
    return this.prisma.interview.findMany({
      where: {
        ...(filters?.applicationId && { applicationId: filters.applicationId }),
        ...(filters?.interviewerId && { interviewerId: filters.interviewerId }),
      },
      include: {
        application: { include: { candidate: true, job: true } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  create(data: any) {
    return this.prisma.interview.create({
      data,
      include: { application: { include: { candidate: true } } },
    });
  }

  update(id: string, data: any) {
    return this.prisma.interview.update({ where: { id }, data });
  }
}
