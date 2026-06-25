import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password: string;
  @ApiProperty({ enum: ['ADMIN', 'RECRUITER', 'HIRING_MANAGER'], required: false })
  @IsOptional() @IsEnum(['ADMIN', 'RECRUITER', 'HIRING_MANAGER']) role?: string;
}
