import { ApiProperty } from '@nestjs/swagger';
import { Measure, Survey, SurveyType } from '@tips/data/models';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateSurveyDto implements DTOBase<Survey> {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  type: SurveyType;

  @IsArray()
  measures: Measure[];

  @IsBoolean()
  public: boolean;

  @IsBoolean()
  active: boolean;

  @IsBoolean()
  final: boolean;
}
