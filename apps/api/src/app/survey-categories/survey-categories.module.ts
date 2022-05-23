import { Module } from '@nestjs/common';
import { SurveyCategoriesService } from './survey-categories.service';
import { SurveyCategoriesController } from './survey-categories.controller';

@Module({
  controllers: [SurveyCategoriesController],
  providers: [SurveyCategoriesService],
})
export class SurveyCategoriesModule {}
