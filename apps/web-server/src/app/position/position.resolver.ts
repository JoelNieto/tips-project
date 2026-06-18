import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PositionEntity } from './dto/position.entity';
import { CreatePositionInput } from './dto/create-position.input';
import { UpdatePositionInput } from './dto/update-position.input';
import { PositionService } from './position.service';

@Resolver(() => PositionEntity)
export class PositionResolver {
  constructor(private readonly positionService: PositionService) {}

  @Query(() => [PositionEntity], { name: 'positions' })
  async positions(@Args('companyId', { type: () => ID }) companyId: string) {
    return this.positionService.findByCompany(companyId);
  }

  @Query(() => PositionEntity, { name: 'position', nullable: true })
  async position(@Args('id', { type: () => ID }) id: string) {
    return this.positionService.findOne(id);
  }

  @Mutation(() => PositionEntity)
  async createPosition(@Args('input') input: CreatePositionInput) {
    return this.positionService.create(input);
  }

  @Mutation(() => PositionEntity)
  async updatePosition(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePositionInput
  ) {
    return this.positionService.update(id, input);
  }

  @Mutation(() => PositionEntity)
  async deletePosition(@Args('id', { type: () => ID }) id: string) {
    return this.positionService.delete(id);
  }
}
