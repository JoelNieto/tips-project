import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { QuestionEntity } from './dto/question.entity';
import { SurveyUsageEntity } from './dto/survey-usage.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { QuestionService } from './question.service';

@Resolver(() => QuestionEntity)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [QuestionEntity], { name: 'questions' })
  async questions(@Session() session: UserSession) {
    return this.questionService.findAll(session.user.id);
  }

  @Query(() => QuestionEntity, { name: 'question', nullable: true })
  async question(@Args('id', { type: () => ID }) id: string) {
    return this.questionService.findOne(id);
  }

  @Query(() => [SurveyUsageEntity], { name: 'surveysUsingQuestion' })
  async surveysUsingQuestion(@Args('questionId', { type: () => ID }) questionId: string) {
    return this.questionService.surveysUsingQuestion(questionId);
  }

  @Mutation(() => QuestionEntity)
  async createQuestion(
    @Args('input') input: CreateQuestionInput,
    @Session() session: UserSession
  ) {
    return this.questionService.create(input, session.user.id);
  }

  @Mutation(() => QuestionEntity)
  async updateQuestion(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateQuestionInput,
    @Session() session: UserSession
  ) {
    return this.questionService.update(id, input, session.user.id);
  }

  @Mutation(() => QuestionEntity)
  async deleteQuestion(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.questionService.delete(id, session.user.id);
  }
}
