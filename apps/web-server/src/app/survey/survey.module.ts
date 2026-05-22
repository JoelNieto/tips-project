import { Module } from '@nestjs/common';
import { SurveyTypeResolver } from './survey-type.resolver';
import { SurveyTypeService } from './survey-type.service';
import { SurveyResolver } from './survey.resolver';
import { SurveyService } from './survey.service';
import { DimensionResolver } from './dimension.resolver';
import { DimensionService } from './dimension.service';
import { QuestionResolver } from './question.resolver';
import { QuestionService } from './question.service';
import { DimensionQuestionResolver } from './dimension-question.resolver';
import { DimensionQuestionService } from './dimension-question.service';
import { MainQuestionAnswerResolver } from './main-question-answer.resolver';
import { MainQuestionAnswerService } from './main-question-answer.service';
import { AnswerResolver } from './answer.resolver';
import { AnswerService } from './answer.service';
import { SurveyAssignationResolver } from './survey-assignation.resolver';
import { SurveyAssignationService } from './survey-assignation.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    SurveyTypeResolver,
    SurveyTypeService,
    SurveyResolver,
    SurveyService,
    DimensionResolver,
    DimensionService,
    QuestionResolver,
    QuestionService,
    DimensionQuestionResolver,
    DimensionQuestionService,
    MainQuestionAnswerResolver,
    MainQuestionAnswerService,
    AnswerResolver,
    AnswerService,
    SurveyAssignationResolver,
    SurveyAssignationService,
  ],
  exports: [
    SurveyTypeService,
    SurveyService,
    DimensionService,
    QuestionService,
    DimensionQuestionService,
    MainQuestionAnswerService,
    AnswerService,
    SurveyAssignationService,
  ],
})
export class SurveyModule {}
