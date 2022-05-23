import { Test, TestingModule } from '@nestjs/testing';
import { SurveyCategoriesController } from './survey-categories.controller';
import { SurveyCategoriesService } from './survey-categories.service';

describe('SurveyCategoriesController', () => {
  let controller: SurveyCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyCategoriesController],
      providers: [SurveyCategoriesService],
    }).compile();

    controller = module.get<SurveyCategoriesController>(
      SurveyCategoriesController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
