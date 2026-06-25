import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ minLength: 8 }) @IsOptional() @IsString() @MinLength(8) password?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() avatarUrl?: string;
  @ApiPropertyOptional({ enum: ['ADMIN', 'RECRUITER', 'HIRING_MANAGER'] })
  @IsOptional() @IsEnum(['ADMIN', 'RECRUITER', 'HIRING_MANAGER']) role?: string;
}
