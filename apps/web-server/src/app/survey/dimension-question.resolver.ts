import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { DimensionQuestionEntity } from './dto/dimension-question.entity';
import { AddQuestionToDimensionInput } from './dto/add-question-to-dimension.input';
import { UpdateDimensionQuestionOverridesInput } from './dto/update-dimension-question-overrides.input';
import { DimensionQuestionService } from './dimension-question.service';

@Resolver(() => DimensionQuestionEntity)
export class DimensionQuestionResolver {
  constructor(private readonly dimensionQuestionService: DimensionQuestionService) {}

  @Mutation(() => DimensionQuestionEntity)
  async addQuestionToDimension(
    @Args('input') input: AddQuestionToDimensionInput,
    @Session() session: UserSession
  ) {
    return this.dimensionQuestionService.addQuestionToDimension(
      input,
      session.user.id
    );
  }

  @Mutation(() => DimensionQuestionEntity)
  async removeQuestionFromDimension(
    @Args('dimensionQuestionId', { type: () => ID }) dimensionQuestionId: string,
    @Session() session: UserSession
  ) {
    return this.dimensionQuestionService.removeQuestionFromDimension(
      dimensionQuestionId,
      session.user.id
    );
  }

  @Mutation(() => DimensionQuestionEntity)
  async updateDimensionQuestionOverrides(
    @Args('input') input: UpdateDimensionQuestionOverridesInput,
    @Session() session: UserSession
  ) {
    return this.dimensionQuestionService.updateOverrides(
      input,
      session.user.id
    );
  }
}
