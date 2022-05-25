import { Test, TestingModule } from '@nestjs/testing';

import { SurveysService } from '../services/surveys.service';
import { SurveysController } from './surveys.controller';

describe('SurveysController', () => {
  let controller: SurveysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [SurveysService],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
