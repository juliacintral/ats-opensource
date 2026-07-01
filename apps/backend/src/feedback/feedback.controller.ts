import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Get()
  findByApplication(@Query('applicationId') applicationId: string) {
    return this.feedbackService.findByApplication(applicationId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.feedbackService.create({ ...body, authorId: req.user.sub });
  }
}
