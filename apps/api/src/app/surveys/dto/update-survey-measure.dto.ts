import { PartialType } from '@nestjs/swagger';
import { CreateSurveyMeasureDto } from './create-survey-measure.dto';

export class UpdateSurveyMeasureDto extends PartialType(
  CreateSurveyMeasureDto
) {}
