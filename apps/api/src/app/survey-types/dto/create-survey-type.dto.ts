import { ApiProperty } from '@nestjs/swagger';
import { SurveyType } from '@tips/data/models';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateSurveyTypeDto implements DTOBase<SurveyType> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @ApiProperty()
  hasRadar: boolean;

  @IsBoolean()
  @ApiProperty()
  hasBar: boolean;

  @IsBoolean()
  @ApiProperty()
  hasMeasureQuestion: boolean;

  @IsString()
  @ApiProperty()
  prefix: string;

  @IsString()
  @ApiProperty()
  measureName: string;

  @ApiProperty()
  @IsString()
  subMeasureName: string;

  @IsBoolean()
  @ApiProperty()
  visibleMeasures: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  instructions?: string;

  @IsBoolean()
  @ApiProperty()
  isRandom: boolean;
}
