import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  findAll(@Query('search') search?: string) { return this.candidatesService.findAll(search); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.candidatesService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.candidatesService.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.candidatesService.update(id, body); }
}
