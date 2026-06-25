import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() portfolioUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
}
