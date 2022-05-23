import { Test, TestingModule } from '@nestjs/testing';
import { SurveyTypesController } from './survey-types.controller';
import { SurveyTypesService } from './survey-types.service';

describe('SurveyTypesController', () => {
  let controller: SurveyTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyTypesController],
      providers: [SurveyTypesService],
    }).compile();

    controller = module.get<SurveyTypesController>(SurveyTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
