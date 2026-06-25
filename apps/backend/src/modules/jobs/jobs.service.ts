import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

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
        salaryMin: dto.salaryMin ? dto.salaryMin : undefined,
        salaryMax: dto.salaryMax ? dto.salaryMax : undefined,
        recruiterId,
        pipeline: {
          create: DEFAULT_PIPELINE.map((name, order) => ({ name, order })),
        },
      },
      include: {
        pipeline: { orderBy: { order: 'asc' } },
        recruiter: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(status?: string, search?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.job.findMany({
      where,
      include: {
        recruiter: { select: { id: true, name: true } },
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
        recruiter: { select: { id: true, name: true, email: true } },
        pipeline: {
          orderBy: { order: 'asc' },
          include: {
            applications: {
              include: {
                candidate: { select: { id: true, name: true, email: true, aiSummary: true } },
              },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Vaga não encontrada');
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.findOne(id);
    return this.prisma.job.update({
      where: { id },
      data: dto,
      include: { pipeline: { orderBy: { order: 'asc' } } },
    });
  }

  async addStage(jobId: string, name: string) {
    const lastStage = await this.prisma.stage.findFirst({
      where: { jobId },
      orderBy: { order: 'desc' },
    });
    const order = lastStage ? lastStage.order + 1 : 0;
    return this.prisma.stage.create({ data: { jobId, name, order } });
  }

  async removeStage(stageId: string) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: { _count: { select: { applications: true } } },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if ((stage._count as any).applications > 0)
      throw new Error('Estágio possui candidatos, mova-os antes de remover');
    return this.prisma.stage.delete({ where: { id: stageId } });
  }

  async getMetrics() {
    const [total, open, paused, closed, totalApps, hiredApps] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'OPEN' } }),
      this.prisma.job.count({ where: { status: 'PAUSED' } }),
      this.prisma.job.count({ where: { status: 'CLOSED' } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: 'HIRED' } }),
    ]);
    return { total, open, paused, closed, totalApplications: totalApps, totalHired: hiredApps };
  }
}
