import { ApiProperty } from '@nestjs/swagger';
import { Company, Position } from '@tips/data/models';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreatePositionDto implements DTOBase<Position> {
  @ApiProperty()
  @IsNotEmpty()
  company: Company;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  isPosition: boolean;

  @ApiProperty()
  @IsArray()
  children: Position[];

  @ApiProperty()
  @IsOptional()
  parent: Position;
}
