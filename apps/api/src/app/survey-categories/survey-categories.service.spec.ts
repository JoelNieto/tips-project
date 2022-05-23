import { Test, TestingModule } from '@nestjs/testing';
import { SurveyCategoriesService } from './survey-categories.service';

describe('SurveyCategoriesService', () => {
  let service: SurveyCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveyCategoriesService],
    }).compile();

    service = module.get<SurveyCategoriesService>(SurveyCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
