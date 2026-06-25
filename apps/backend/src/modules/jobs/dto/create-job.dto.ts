import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requirements?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRemote?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Transform(({ value }) => Number(value)) salaryMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Transform(({ value }) => Number(value)) salaryMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() salaryCurrency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional({ enum: ['DRAFT', 'OPEN'] }) @IsOptional() @IsEnum(['DRAFT', 'OPEN']) status?: string;
}
