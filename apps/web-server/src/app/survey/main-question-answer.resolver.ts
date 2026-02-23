import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { MainQuestionAnswerEntity } from './dto/main-question-answer.entity';
import { CreateMainQuestionAnswerInput } from './dto/create-main-question-answer.input';
import { UpdateMainQuestionAnswerInput } from './dto/update-main-question-answer.input';
import { MainQuestionAnswerService } from './main-question-answer.service';

@Resolver(() => MainQuestionAnswerEntity)
export class MainQuestionAnswerResolver {
  constructor(
    private readonly mainQuestionAnswerService: MainQuestionAnswerService
  ) {}

  @Mutation(() => MainQuestionAnswerEntity)
  async createMainQuestionAnswer(
    @Args('input') input: CreateMainQuestionAnswerInput,
    @Session() session: UserSession
  ) {
    return this.mainQuestionAnswerService.create(input, session.user.id);
  }

  @Mutation(() => MainQuestionAnswerEntity)
  async updateMainQuestionAnswer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMainQuestionAnswerInput,
    @Session() session: UserSession
  ) {
    return this.mainQuestionAnswerService.update(id, input, session.user.id);
  }

  @Mutation(() => MainQuestionAnswerEntity)
  async deleteMainQuestionAnswer(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.mainQuestionAnswerService.delete(id, session.user.id);
  }
}
