import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos os usuários (ADMIN)' })
  list() {
    return this.users.list();
  }

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  me(@CurrentUser() user: any) {
    return this.users.findById(user.id);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Buscar usuário por ID (ADMIN)' })
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar próprio perfil' })
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.users.update(user.id, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar usuário por ID (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }
}
