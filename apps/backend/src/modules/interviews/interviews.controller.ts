import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private interviews: InterviewsService) {}

  @Post()
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Agendar entrevista' })
  schedule(@Body() dto: CreateInterviewDto, @CurrentUser() user: any) {
    return this.interviews.schedule(dto, user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Minhas próximas entrevistas' })
  mine(@CurrentUser() user: any) {
    return this.interviews.findByInterviewer(user.id);
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Entrevistas de uma candidatura' })
  byApplication(@Param('applicationId') applicationId: string) {
    return this.interviews.findByApplication(applicationId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Atualizar status da entrevista' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.interviews.updateStatus(id, status);
  }

  @Post(':id/feedback')
  @Roles('ADMIN', 'RECRUITER', 'HIRING_MANAGER')
  @ApiOperation({ summary: 'Submeter feedback (scorecard)' })
  feedback(@Param('id') id: string, @Body() dto: CreateFeedbackDto, @CurrentUser() user: any) {
    return this.interviews.submitFeedback(id, dto, user.id);
  }

  @Get('feedback/:applicationId')
  @ApiOperation({ summary: 'Feedbacks consolidados de uma candidatura' })
  getFeedback(@Param('applicationId') applicationId: string) {
    return this.interviews.getFeedbackByApplication(applicationId);
  }
}
