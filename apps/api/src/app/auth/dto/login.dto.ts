import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    example: 'joel.nieto@domain.com',
    description: 'User email',
    required: true,
  })
  @IsEmail()
  username: string;

  @ApiProperty({ example: 'abcd1234', required: true })
  @IsString()
  password: string;
}
