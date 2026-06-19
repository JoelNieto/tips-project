import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { AnswerSetEntity } from './dto/answer-set.entity';
import { CreateAnswerSetInput } from './dto/create-answer-set.input';
import { UpdateAnswerSetInput } from './dto/update-answer-set.input';
import { AnswerSetService } from './answer-set.service';

@Resolver(() => AnswerSetEntity)
export class AnswerSetResolver {
  constructor(private readonly answerSetService: AnswerSetService) {}

  @Query(() => [AnswerSetEntity], { name: 'answerSets' })
  async answerSets(@Session() session: UserSession) {
    return this.answerSetService.findAll(session.user.id);
  }

  @Query(() => AnswerSetEntity, { name: 'answerSet', nullable: true })
  async answerSet(@Args('id', { type: () => ID }) id: string) {
    return this.answerSetService.findOne(id);
  }

  @Mutation(() => AnswerSetEntity)
  async createAnswerSet(
    @Args('input') input: CreateAnswerSetInput,
    @Session() session: UserSession
  ) {
    return this.answerSetService.create(input, session.user.id);
  }

  @Mutation(() => AnswerSetEntity)
  async updateAnswerSet(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAnswerSetInput,
    @Session() session: UserSession
  ) {
    return this.answerSetService.update(id, input, session.user.id);
  }

  @Mutation(() => AnswerSetEntity)
  async deleteAnswerSet(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.answerSetService.delete(id, session.user.id);
  }
}
