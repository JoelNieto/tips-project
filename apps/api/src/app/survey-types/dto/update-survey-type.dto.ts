import { PartialType } from '@nestjs/swagger';
import { CreateSurveyTypeDto } from './create-survey-type.dto';

export class UpdateSurveyTypeDto extends PartialType(CreateSurveyTypeDto) {}
