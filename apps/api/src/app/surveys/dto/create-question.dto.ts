import { ApiProperty } from '@nestjs/swagger';
import { AnswersSet, Question } from '@tips/data/models';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateQuestionDto implements DTOBase<Question> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsBoolean()
  reverse: boolean;

  @ApiProperty()
  @IsNumber()
  weighting: number;

  @ApiProperty()
  @IsBoolean()
  multiAnswer: boolean;

  @ApiProperty()
  @IsNotEmpty()
  answersSet: AnswersSet;
}
