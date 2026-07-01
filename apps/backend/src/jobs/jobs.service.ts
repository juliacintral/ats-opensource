import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { status?: string; search?: string }) {
    return this.prisma.job.findMany({
      where: {
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { order: 'asc' } },
        applications: {
          include: { candidate: true, currentStage: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  create(data: any) {
    const { stages, ...jobData } = data;
    return this.prisma.job.create({
      data: {
        ...jobData,
        stages: {
          create: stages ?? [
            { name: 'Triagem', order: 0, color: '#6366f1' },
            { name: 'Entrevista RH', order: 1, color: '#f59e0b' },
            { name: 'Entrevista Tecnica', order: 2, color: '#3b82f6' },
            { name: 'Oferta', order: 3, color: '#10b981' },
          ],
        },
      },
      include: { stages: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.job.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.job.delete({ where: { id } });
  }
}
