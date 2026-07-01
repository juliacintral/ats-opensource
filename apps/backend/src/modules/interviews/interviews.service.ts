import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async schedule(dto: CreateInterviewDto, interviewerId: string) {
    const interview = await this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration ?? 60,
        type: dto.type ?? 'VIDEO',
        meetingUrl: dto.meetingUrl,
        notes: dto.notes,
      },
      include: {
        application: { include: { job: { select: { id: true, title: true } }, candidate: { select: { id: true, email: true, name: true } } } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
    });

    if (interview.application.candidate?.email) {
      await this.emailService.sendInterviewInvite(
        interview.application.candidate.email,
        interview.application.candidate.name,
        interview.application.job.title,
        interview.scheduledAt,
        interview.meetingUrl ?? undefined,
      );
    }
    return interview;
  }

  async findByApplication(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        interviewer: { select: { id: true, name: true } },
        feedbacks: { select: { id: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(interviewId: string, status: string) {
    return this.prisma.interview.update({
      where: { id: interviewId },
      data: { status },
    });
  }

  async submitFeedback(interviewId: string, authorId: string, dto: CreateFeedbackDto) {
    await this.prisma.interview.update({ where: { id: interviewId }, data: { status: 'COMPLETED' } });
    const interview = await this.prisma.interview.findUnique({ where: { id: interviewId } });
    return this.prisma.feedback.create({
      data: { interviewId, applicationId: interview.applicationId, authorId, ...dto },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async getFeedbacksByApplication(applicationId: string) {
    return this.prisma.feedback.findMany({
      where: { applicationId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
