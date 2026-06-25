import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty() @IsString() applicationId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() interviewerId?: string;
  @ApiProperty({ enum: ['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL'] })
  @IsEnum(['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL']) type: string;
  @ApiProperty({ example: '2026-07-01T14:00:00Z' }) @IsDateString() scheduledAt: string;
  @ApiPropertyOptional({ default: 60 }) @IsOptional() @IsNumber() @Min(15) durationMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() meetingUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
