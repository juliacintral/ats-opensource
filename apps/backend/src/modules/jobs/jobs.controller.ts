import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AddStageDto } from './dto/add-stage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private jobs: JobsService) {}

  @Post()
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Criar nova vaga' })
  create(@Body() dto: CreateJobDto, @CurrentUser() user: any) {
    return this.jobs.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vagas' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED'] })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.jobs.findAll(status, search);
  }

  @Get('metrics')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Métricas de recrutamento' })
  metrics() {
    return this.jobs.getMetrics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar vaga com pipeline e candidatos' })
  findOne(@Param('id') id: string) {
    return this.jobs.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Atualizar vaga' })
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobs.update(id, dto);
  }

  @Post(':id/stages')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Adicionar estágio ao pipeline da vaga' })
  addStage(@Param('id') jobId: string, @Body() dto: AddStageDto) {
    return this.jobs.addStage(jobId, dto.name);
  }

  @Delete('stages/:stageId')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Remover estágio do pipeline' })
  removeStage(@Param('stageId') stageId: string) {
    return this.jobs.removeStage(stageId);
  }
}
