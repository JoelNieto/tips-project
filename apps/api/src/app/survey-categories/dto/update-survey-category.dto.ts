import { PartialType } from '@nestjs/swagger';
import { CreateSurveyCategoryDto } from './create-survey-category.dto';

export class UpdateSurveyCategoryDto extends PartialType(
  CreateSurveyCategoryDto
) {}
