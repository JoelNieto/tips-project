import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@tips/data/models';
import { IsNotEmpty, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateCompanyDto implements DTOBase<Company> {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  notes?: string;
}
