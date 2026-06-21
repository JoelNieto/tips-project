import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { PositionEntity } from './dto/position.entity';
import { CreatePositionInput } from './dto/create-position.input';
import { UpdatePositionInput } from './dto/update-position.input';
import { PositionService } from './position.service';

@Resolver(() => PositionEntity)
@UseGuards(RolesGuard)
export class PositionResolver {
  constructor(
    private readonly positionService: PositionService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [PositionEntity], { name: 'positions' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async positions(
    @Args('companyId', { type: () => ID }) companyId: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.positionService.findByCompany(companyId, user);
  }

  @Query(() => PositionEntity, { name: 'position', nullable: true })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async position(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.positionService.findOne(id, user);
  }

  @Mutation(() => PositionEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async createPosition(
    @Args('input') input: CreatePositionInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.positionService.create(input, user);
  }

  @Mutation(() => PositionEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async updatePosition(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePositionInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.positionService.update(id, input, user);
  }

  @Mutation(() => PositionEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deletePosition(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.positionService.delete(id, user);
  }
}
