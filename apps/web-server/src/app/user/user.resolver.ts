import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserEntity } from './dto/user.entity';
import '../auth/dto/user-role.enum';
import { UserService } from './user.service';

@Resolver(() => UserEntity)
@UseGuards(RolesGuard)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [UserEntity], { name: 'users' })
  @Roles(UserRole.ADMIN)
  async users(@Session() session: UserSession) {
    const actor = await this.authPolicy.getUserContext(session.user.id);
    return this.userService.findAll(actor);
  }

  @Query(() => UserEntity, { name: 'user', nullable: true })
  @Roles(UserRole.ADMIN)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const actor = await this.authPolicy.getUserContext(session.user.id);
    return this.userService.findOne(id, actor);
  }

  @Mutation(() => UserEntity)
  @Roles(UserRole.ADMIN)
  async createUser(
    @Args('input') input: CreateUserInput,
    @Session() session: UserSession
  ) {
    const actor = await this.authPolicy.getUserContext(session.user.id);
    return this.userService.create(input, actor);
  }

  @Mutation(() => UserEntity)
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @Session() session: UserSession
  ) {
    const actor = await this.authPolicy.getUserContext(session.user.id);
    return this.userService.update(id, input, actor);
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.ADMIN)
  async resetUserPassword(
    @Args('id', { type: () => ID }) id: string,
    @Args('newPassword') newPassword: string,
    @Session() session: UserSession
  ) {
    const actor = await this.authPolicy.getUserContext(session.user.id);
    return this.userService.resetPassword(id, newPassword, actor);
  }
}
