import { ApiProperty } from '@nestjs/swagger';
import { Company, Project } from '@tips/data/models';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateProjectDto implements DTOBase<Project> {
  @ApiProperty()
  @IsOptional()
  company?: Company;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  endDate?: Date;
}
