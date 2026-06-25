import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ana@empresa.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'senhaSegura123', minLength: 8 }) @IsString() @MinLength(8) password: string;
}
