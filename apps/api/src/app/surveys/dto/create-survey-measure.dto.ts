import { ApiProperty } from '@nestjs/swagger';
import { Measure, Question } from '@tips/data/models';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateSurveyMeasureDto implements DTOBase<Measure> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  weighting: number;

  @ApiProperty()
  @IsArray()
  subMeasures: Measure[];

  @ApiProperty()
  @IsOptional()
  mainQuestion: Question;

  @ApiProperty()
  @IsArray()
  questions: Question[];
}
