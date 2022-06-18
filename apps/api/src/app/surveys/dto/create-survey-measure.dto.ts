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
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weighting: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  subMeasures: Measure[];

  @ApiProperty()
  @IsOptional()
  mainQuestion: Question;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  questions: Question[];
}
