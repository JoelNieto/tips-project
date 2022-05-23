import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SurveyType, SurveyTypeSchema } from './schemas/survey-type.schema';
import { SurveyTypesController } from './survey-types.controller';
import { SurveyTypesService } from './survey-types.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SurveyType.name, schema: SurveyTypeSchema },
    ]),
  ],
  controllers: [SurveyTypesController],
  providers: [SurveyTypesService],
})
export class SurveyTypesModule {}
