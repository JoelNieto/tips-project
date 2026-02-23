import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { AnswerEntity } from './dto/answer.entity';
import { CreateAnswerInput } from './dto/create-answer.input';
import { UpdateAnswerInput } from './dto/update-answer.input';
import { AnswerService } from './answer.service';

@Resolver(() => AnswerEntity)
export class AnswerResolver {
  constructor(private readonly answerService: AnswerService) {}

  @Mutation(() => AnswerEntity)
  async createAnswer(
    @Args('input') input: CreateAnswerInput,
    @Session() session: UserSession
  ) {
    return this.answerService.create(input, session.user.id);
  }

  @Mutation(() => AnswerEntity)
  async updateAnswer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAnswerInput,
    @Session() session: UserSession
  ) {
    return this.answerService.update(id, input, session.user.id);
  }

  @Mutation(() => AnswerEntity)
  async deleteAnswer(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.answerService.delete(id, session.user.id);
  }
}
