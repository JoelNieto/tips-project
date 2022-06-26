import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@tips/data/models';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateUserDto implements DTOBase<User> {
  @ApiProperty({ required: true, default: 'John Doe' })
  @IsString()
  username: string;

  @ApiProperty({ required: true, default: 'john.doe@domain.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, minLength: 6 })
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: Role;

  @ApiProperty()
  @IsBoolean()
  isAdmin: boolean;
}
