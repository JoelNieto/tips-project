import { ApiProperty } from '@nestjs/swagger';
import { Measure, Survey, SurveyType } from '@tips/data/models';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateSurveyDto implements DTOBase<Survey> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  type: SurveyType;

  @ApiProperty()
  @IsArray()
  measures: Measure[];

  @IsBoolean()
  public: boolean;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsBoolean()
  final: boolean;
}
