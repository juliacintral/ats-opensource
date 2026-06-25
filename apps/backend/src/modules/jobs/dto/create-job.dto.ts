import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() requirements?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isRemote?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() salaryMin?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() salaryMax?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() department?: string;
}
