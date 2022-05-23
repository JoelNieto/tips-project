import { Test, TestingModule } from '@nestjs/testing';
import { SurveyTypesService } from './survey-types.service';

describe('SurveyTypesService', () => {
  let service: SurveyTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveyTypesService],
    }).compile();

    service = module.get<SurveyTypesService>(SurveyTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
