import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt() @Min(1) @Max(5) rating: number;

  @ApiProperty({ enum: ['STRONG_YES', 'YES', 'NO', 'STRONG_NO'] })
  @IsEnum(['STRONG_YES', 'YES', 'NO', 'STRONG_NO']) recommendation: string;

  @ApiPropertyOptional() @IsOptional() @IsString() strengths?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() weaknesses?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
