import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  findByApplication(applicationId: string) {
    return this.prisma.feedback.findMany({
      where: { applicationId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    applicationId: string;
    authorId: string;
    content: string;
    rating?: number;
    recommendation?: string;
  }) {
    return this.prisma.feedback.create({
      data: { ...data, recommendation: data.recommendation as any },
      include: { author: { select: { id: true, name: true } } },
    });
  }
}
