import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

const DEFAULT_PIPELINE = [
  'Aplicação Recebida',
  'Triagem de Currículo',
  'Entrevista RH',
  'Entrevista Técnica',
  'Entrevista Final',
  'Proposta',
];

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobDto, recruiterId: string) {
    return this.prisma.job.create({
      data: {
        ...dto,
        recruiterId,
        pipeline: {
          create: DEFAULT_PIPELINE.map((name, order) => ({ name, order })),
        },
      },
      include: { pipeline: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(status?: string) {
    return this.prisma.job.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        pipeline: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        pipeline: {
          orderBy: { order: 'asc' },
          include: { applications: { include: { candidate: true } } },
        },
        recruiter: { select: { id: true, name: true, email: true } },
      },
    });
    if (!job) throw new NotFoundException('Vaga não encontrada');
    return job;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.job.update({ where: { id }, data: { status: status as any } });
  }

  async getMetrics() {
    const [totalJobs, openJobs, totalApplications] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'OPEN' } }),
      this.prisma.application.count(),
    ]);
    return { totalJobs, openJobs, totalApplications };
  }
}
