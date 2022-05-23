import { SurveyCategory } from '@tips/data/models';

import { DTOBase } from '../../shared/base.schema';

export class CreateSurveyCategoryDto implements DTOBase<SurveyCategory> {
  name: string;
}
