import { ApiProperty } from '@nestjs/swagger';
import { Answer, AnswersSet } from '@tips/data/models';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateAnswerSetDto implements DTOBase<AnswersSet> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  answers: Answer[];
}
