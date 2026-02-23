import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { DimensionEntity } from './dto/dimension.entity';
import { CreateDimensionInput } from './dto/create-dimension.input';
import { UpdateDimensionInput } from './dto/update-dimension.input';
import { DimensionService } from './dimension.service';

@Resolver(() => DimensionEntity)
export class DimensionResolver {
  constructor(private readonly dimensionService: DimensionService) {}

  @Query(() => [DimensionEntity], { name: 'dimensions' })
  async dimensions(
    @Args('surveyId', { type: () => ID }) surveyId: string,
    @Session() session: UserSession
  ) {
    return this.dimensionService.findBySurvey(surveyId);
  }

  @Query(() => DimensionEntity, { name: 'dimension', nullable: true })
  async dimension(@Args('id', { type: () => ID }) id: string) {
    return this.dimensionService.findOne(id);
  }

  @Mutation(() => DimensionEntity)
  async createDimension(
    @Args('input') input: CreateDimensionInput,
    @Session() session: UserSession
  ) {
    return this.dimensionService.create(input, session.user.id);
  }

  @Mutation(() => DimensionEntity)
  async updateDimension(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDimensionInput,
    @Session() session: UserSession
  ) {
    return this.dimensionService.update(id, input, session.user.id);
  }

  @Mutation(() => DimensionEntity)
  async deleteDimension(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.dimensionService.delete(id, session.user.id);
  }
}
