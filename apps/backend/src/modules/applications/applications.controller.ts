import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private apps: ApplicationsService) {}

  @Post()
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Criar candidatura' })
  apply(@Body('jobId') jobId: string, @Body('candidateId') candidateId: string) {
    return this.apps.apply(jobId, candidateId);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Listar candidatos de uma vaga' })
  @ApiQuery({ name: 'stageId', required: false })
  byJob(@Param('jobId') jobId: string, @Query('stageId') stageId?: string) {
    return this.apps.findByJob(jobId, stageId);
  }

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: 'Listar candidaturas de um candidato' })
  byCandidate(@Param('candidateId') candidateId: string) {
    return this.apps.findByCandidate(candidateId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar candidatura completa' })
  findOne(@Param('id') id: string) {
    return this.apps.findOne(id);
  }

  @Patch(':id/stage')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Mover candidato para outro estágio (kanban)' })
  moveStage(@Param('id') id: string, @Body('stageId') stageId: string) {
    return this.apps.moveStage(id, stageId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Atualizar status da candidatura' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.apps.updateStatus(id, status);
  }

  @Patch(':id/notes')
  @Roles('ADMIN', 'RECRUITER', 'HIRING_MANAGER')
  @ApiOperation({ summary: 'Adicionar notas à candidatura' })
  addNote(@Param('id') id: string, @Body('notes') notes: string) {
    return this.apps.addNote(id, notes);
  }
}
