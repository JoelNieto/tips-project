import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { SurveyEntity } from './dto/survey.entity';
import { CreateSurveyInput } from './dto/create-survey.input';
import { UpdateSurveyInput } from './dto/update-survey.input';
import { SurveyService } from './survey.service';

@Resolver(() => SurveyEntity)
@UseGuards(RolesGuard)
export class SurveyResolver {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [SurveyEntity], { name: 'surveys' })
  @Roles(UserRole.ADMIN, UserRole.DESIGNER, UserRole.ORG_ADMIN)
  async surveys(@Session() session: UserSession) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyService.findAll(user);
  }

  @Query(() => SurveyEntity, { name: 'survey', nullable: true })
  @Roles(UserRole.ADMIN, UserRole.DESIGNER, UserRole.ORG_ADMIN)
  async survey(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyService.findOne(id, user);
  }

  @Mutation(() => SurveyEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async createSurvey(
    @Args('input') input: CreateSurveyInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyService.create(input, user);
  }

  @Mutation(() => SurveyEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async updateSurvey(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSurveyInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyService.update(id, input, user);
  }

  @Mutation(() => SurveyEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async deleteSurvey(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyService.delete(id, user);
  }
}
