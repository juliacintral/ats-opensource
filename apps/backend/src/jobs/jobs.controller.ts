import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.jobsService.findAll({ status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.jobsService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.jobsService.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.jobsService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.jobsService.remove(id); }
}
