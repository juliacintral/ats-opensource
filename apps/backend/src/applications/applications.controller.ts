import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  findByJob(@Query('jobId') jobId: string) { return this.applicationsService.findByJob(jobId); }

  @Post()
  create(@Body() body: { candidateId: string; jobId: string; stageId: string }) {
    return this.applicationsService.create(body);
  }

  @Put(':id/stage')
  moveStage(@Param('id') id: string, @Body() body: { stageId: string }) {
    return this.applicationsService.moveStage(id, body.stageId);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.applicationsService.updateStatus(id, body.status);
  }
}
