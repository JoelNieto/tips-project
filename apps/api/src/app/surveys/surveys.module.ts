import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnswerSetsController } from './controllers/answer-sets.controller';
import { QuestionsController } from './controllers/questions.controller';
import { SurveyMeasuresController } from './controllers/survey-measures.controller';
import { SurveysController } from './controllers/surveys.controller';
import { AnswerSet, AnswerSetSchema } from './schemas/answer-set.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { MeasureSchema, SurveyMeasure } from './schemas/survey-measure.schema';
import { Survey, SurveySchema } from './schemas/survey.schemas';
import { AnswerSetsService } from './services/answer-sets.service';
import { QuestionsService } from './services/questions.service';
import { SurveyMeasuresService } from './services/survey-measures.service';
import { SurveysService } from './services/surveys.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnswerSet.name, schema: AnswerSetSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: SurveyMeasure.name, schema: MeasureSchema },
      { name: Survey.name, schema: SurveySchema },
    ]),
  ],
  controllers: [
    SurveysController,
    AnswerSetsController,
    QuestionsController,
    SurveyMeasuresController,
  ],
  providers: [
    SurveysService,
    AnswerSetsService,
    QuestionsService,
    SurveyMeasuresService,
  ],
})
export class SurveysModule {}
