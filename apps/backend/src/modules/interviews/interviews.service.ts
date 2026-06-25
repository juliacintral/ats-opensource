import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async schedule(dto: CreateInterviewDto, interviewerId: string) {
    const interview = await this.prisma.interview.create({
      data: { ...dto, interviewerId, scheduledAt: new Date(dto.scheduledAt) },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
        application: {
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true } },
          },
        },
      },
    });

    // Notifica candidato por e-mail
    const candidate = interview.application?.candidate;
    const job = interview.application?.job;
    if (candidate?.email && job) {
      this.email.sendInterviewScheduled(
        candidate.email,
        candidate.name,
        job.title,
        interview.scheduledAt,
        interview.meetingUrl ?? undefined,
      ).catch(() => {});
    }

    return interview;
  }

  async findByApplication(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        interviewer: { select: { id: true, name: true } },
        feedback: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findByInterviewer(interviewerId: string) {
    const now = new Date();
    return this.prisma.interview.findMany({
      where: { interviewerId, scheduledAt: { gte: now } },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true } },
          },
        },
        feedback: { select: { id: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.interview.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async submitFeedback(interviewId: string, dto: CreateFeedbackDto, authorId: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Entrevista não encontrada');
    await this.prisma.interview.update({ where: { id: interviewId }, data: { status: 'COMPLETED' } });
    return this.prisma.feedback.create({
      data: { interviewId, applicationId: interview.applicationId, authorId, ...dto },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async getFeedbackByApplication(applicationId: string) {
    return this.prisma.feedback.findMany({
      where: { applicationId },
      include: { author: { select: { id: true, name: true } }, interview: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
