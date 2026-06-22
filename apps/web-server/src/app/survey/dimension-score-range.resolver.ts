import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { DimensionScoreRangeEntity } from './dto/dimension-score-range.entity';
import { CreateDimensionScoreRangeInput } from './dto/create-dimension-score-range.input';
import { UpdateDimensionScoreRangeInput } from './dto/update-dimension-score-range.input';
import { DimensionScoreRangeService } from './dimension-score-range.service';

@Resolver(() => DimensionScoreRangeEntity)
export class DimensionScoreRangeResolver {
  constructor(
    private readonly dimensionScoreRangeService: DimensionScoreRangeService
  ) {}

  @Mutation(() => DimensionScoreRangeEntity)
  async createDimensionScoreRange(
    @Args('input') input: CreateDimensionScoreRangeInput,
    @Session() session: UserSession
  ) {
    return this.dimensionScoreRangeService.create(input, session.user.id);
  }

  @Mutation(() => DimensionScoreRangeEntity)
  async updateDimensionScoreRange(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDimensionScoreRangeInput,
    @Session() session: UserSession
  ) {
    return this.dimensionScoreRangeService.update(id, input, session.user.id);
  }

  @Mutation(() => DimensionScoreRangeEntity)
  async deleteDimensionScoreRange(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.dimensionScoreRangeService.delete(id, session.user.id);
  }
}
