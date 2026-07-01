import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.candidate.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: { job: true, currentStage: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  create(data: any) {
    return this.prisma.candidate.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.candidate.update({ where: { id }, data });
  }
}
