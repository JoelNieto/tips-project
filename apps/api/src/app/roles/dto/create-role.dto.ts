import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@tips/data/models';
import { IsBoolean, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateRoleDto implements DTOBase<Role> {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  admin: boolean;
}
