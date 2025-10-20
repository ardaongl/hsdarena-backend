import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
    type: 'string',
    format: 'email'
  })
  @IsEmail() 
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'Admin123!',
    type: 'string',
    minLength: 6
  })
  @IsString() 
  @MinLength(6) 
  password: string;
}