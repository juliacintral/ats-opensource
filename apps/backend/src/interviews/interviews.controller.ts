import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Get()
  findAll(
    @Query('applicationId') applicationId?: string,
    @Query('interviewerId') interviewerId?: string,
  ) {
    return this.interviewsService.findAll({ applicationId, interviewerId });
  }

  @Post()
  create(@Body() body: any) { return this.interviewsService.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.interviewsService.update(id, body); }
}
