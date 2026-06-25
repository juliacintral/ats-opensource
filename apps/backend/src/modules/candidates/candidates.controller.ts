import {
  Controller, Get, Post, Patch, Param, Body,
  Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StorageService } from '../storage/storage.service';

@ApiTags('Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(
    private candidates: CandidatesService,
    private storage: StorageService,
  ) {}

  @Post()
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Criar candidato manualmente' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidates.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar / buscar candidatos (FTS PostgreSQL)' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca full-text em nome, e-mail e currículo' })
  findAll(@Query('search') search?: string) {
    return this.candidates.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Perfil completo com todas as candidaturas' })
  findOne(@Param('id') id: string) {
    return this.candidates.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Atualizar candidato' })
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidates.update(id, dto);
  }

  @Post(':id/resume')
  @Roles('ADMIN', 'RECRUITER')
  @ApiOperation({ summary: 'Upload + parsing de currículo via IA local (Ollama/OpenRouter)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        cb(null, allowed.includes(file.mimetype));
      },
    })
  )
  async uploadResume(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);
    return this.candidates.processResume(id, file.buffer, file.mimetype, fileUrl);
  }

  @Post(':candidateId/rank/:jobId')
  @Roles('ADMIN', 'RECRUITER', 'HIRING_MANAGER')
  @ApiOperation({ summary: 'Rankear candidato para uma vaga via IA (retorna score 0-100)' })
  rank(@Param('candidateId') candidateId: string, @Param('jobId') jobId: string) {
    return this.candidates.rankForJob(candidateId, jobId);
  }
}
