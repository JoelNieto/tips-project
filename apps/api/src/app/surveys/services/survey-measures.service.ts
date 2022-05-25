import { Injectable } from '@nestjs/common';

import { CreateSurveyMeasureDto } from '../dto/create-survey-measure.dto';
import { UpdateSurveyMeasureDto } from '../dto/update-survey-measure.dto';

@Injectable()
export class SurveyMeasuresService {
  create(createSurveyMeasureDto: CreateSurveyMeasureDto) {
    return 'This action adds a new surveyMeasure';
  }

  findAll() {
    return `This action returns all surveyMeasures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} surveyMeasure`;
  }

  update(id: number, updateSurveyMeasureDto: UpdateSurveyMeasureDto) {
    return `This action updates a #${id} surveyMeasure`;
  }

  remove(id: number) {
    return `This action removes a #${id} surveyMeasure`;
  }
}
