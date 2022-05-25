import { Test, TestingModule } from '@nestjs/testing';

import { SurveyMeasuresService } from '../../survey-measures/survey-measures.service';
import { SurveyMeasuresController } from './survey-measures.controller';

describe('SurveyMeasuresController', () => {
  let controller: SurveyMeasuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyMeasuresController],
      providers: [SurveyMeasuresService],
    }).compile();

    controller = module.get<SurveyMeasuresController>(SurveyMeasuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
