import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import {
  OrganizationEntity,
  OrganizationSurveyEntity,
} from './dto/organization.entity';
import {
  AssignSurveyToOrganizationInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from './dto/organization.input';
import { OrganizationService } from './organization.service';

@Resolver(() => OrganizationEntity)
@UseGuards(RolesGuard)
export class OrganizationResolver {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [OrganizationEntity], { name: 'organizations' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async organizations(@Session() session: UserSession) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.findAll(user);
  }

  @Query(() => OrganizationEntity, { name: 'organization', nullable: true })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async organization(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.findOne(id, user);
  }

  @Query(() => [OrganizationSurveyEntity], {
    name: 'organizationSurveys',
  })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async organizationSurveys(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.listAssignedSurveys(organizationId, user);
  }

  @Mutation(() => OrganizationEntity)
  @Roles(UserRole.ADMIN)
  async createOrganization(
    @Args('input') input: CreateOrganizationInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.create(input, user);
  }

  @Mutation(() => OrganizationEntity)
  @Roles(UserRole.ADMIN)
  async updateOrganization(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOrganizationInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.update(id, input, user);
  }

  @Mutation(() => OrganizationEntity)
  @Roles(UserRole.ADMIN)
  async deleteOrganization(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.delete(id, user);
  }

  @Mutation(() => OrganizationSurveyEntity)
  @Roles(UserRole.ADMIN)
  async assignSurveyToOrganization(
    @Args('input') input: AssignSurveyToOrganizationInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.assignSurvey(input, user);
  }

  @Mutation(() => OrganizationSurveyEntity)
  @Roles(UserRole.ADMIN)
  async removeSurveyFromOrganization(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.organizationService.removeSurveyAssignment(id, user);
  }
}
