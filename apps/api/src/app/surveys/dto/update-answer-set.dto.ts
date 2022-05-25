import { PartialType } from '@nestjs/swagger';
import { CreateAnswerSetDto } from './create-answer-set.dto';

export class UpdateAnswerSetDto extends PartialType(CreateAnswerSetDto) {}
