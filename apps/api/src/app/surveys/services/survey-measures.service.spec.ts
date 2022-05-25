import { Test, TestingModule } from '@nestjs/testing';
import { SurveyMeasuresService } from './survey-measures.service';

describe('SurveyMeasuresService', () => {
  let service: SurveyMeasuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveyMeasuresService],
    }).compile();

    service = module.get<SurveyMeasuresService>(SurveyMeasuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
