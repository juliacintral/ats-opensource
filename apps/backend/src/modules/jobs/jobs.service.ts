import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobDto, recruiterId: string) {
    const job = await this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        department: dto.department,
        location: dto.location,
        type: dto.type,
        salaryMin: dto.salaryMin ? dto.salaryMin : undefined,
        salaryMax: dto.salaryMax ? dto.salaryMax : undefined,
        recruiterId,
      },
      include: { pipeline: { orderBy: { order: 'asc' } } },
    });

    // Stages padrão
    const defaultStages = [
      { name: 'Triagem', order: 1, color: '#6366f1' },
      { name: 'Entrevista RH', order: 2, color: '#f59e0b' },
      { name: 'Entrevista Técnica', order: 3, color: '#10b981' },
      { name: 'Proposta', order: 4, color: '#3b82f6' },
    ];
    await this.prisma.stage.createMany({ data: defaultStages.map(s => ({ ...s, jobId: job.id })) });

    return this.prisma.job.findUnique({
      where: { id: job.id },
      include: { pipeline: { orderBy: { order: 'asc' } }, recruiter: { select: { id: true, name: true } } },
    });
  }

  async findAll(status?: string) {
    return this.prisma.job.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        pipeline: { orderBy: { order: 'asc' } },
        recruiter: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        pipeline: { orderBy: { order: 'asc' } },
        recruiter: { select: { id: true, name: true, email: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Vaga não encontrada');
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id },
      data: dto as any,
      include: { pipeline: { orderBy: { order: 'asc' } } },
    });
  }

  async addStage(jobId: string, name: string, color?: string) {
    const last = await this.prisma.stage.findFirst({ where: { jobId }, orderBy: { order: 'desc' } });
    return this.prisma.stage.create({
      data: { name, jobId, order: (last?.order ?? 0) + 1, color: color ?? '#6366f1' },
    });
  }

  async reorderStages(jobId: string, stageIds: string[]) {
    await Promise.all(
      stageIds.map((id, index) =>
        this.prisma.stage.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    return this.prisma.stage.findMany({ where: { jobId }, orderBy: { order: 'asc' } });
  }
}
