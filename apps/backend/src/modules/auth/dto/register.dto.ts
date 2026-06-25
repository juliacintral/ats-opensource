import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Souza' }) @IsString() name: string;
  @ApiProperty({ example: 'ana@empresa.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'senhaSegura123', minLength: 8 }) @IsString() @MinLength(8) password: string;
  @ApiPropertyOptional({ enum: ['ADMIN', 'RECRUITER', 'HIRING_MANAGER'], default: 'RECRUITER' })
  @IsOptional() @IsEnum(['ADMIN', 'RECRUITER', 'HIRING_MANAGER']) role?: string;
}
