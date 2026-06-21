import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AllowAnonymous, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { SurveyAssignationEntity } from './dto/survey-assignation.entity';
import { CreateSurveyAssignationInput } from './dto/create-survey-assignation.input';
import { SubmitSurveyFillInput } from './dto/submit-survey-fill.input';
import { SurveyFillSubmissionEntity } from './dto/survey-fill-submission.entity';
import { SurveyAssignationResultsEntity } from './dto/survey-fill-result.entity';
import { SurveyInviteContextEntity } from './dto/survey-invite.entity';
import { SurveyAssignationService } from './survey-assignation.service';

@Resolver(() => SurveyAssignationEntity)
@UseGuards(RolesGuard)
export class SurveyAssignationResolver {
  constructor(
    private readonly surveyAssignationService: SurveyAssignationService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [SurveyAssignationEntity], { name: 'surveyAssignations' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async surveyAssignations(
    @Args('surveyId', { type: () => ID }) surveyId: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyAssignationService.findBySurvey(surveyId, user);
  }

  @Query(() => SurveyAssignationEntity, {
    name: 'surveyAssignation',
    nullable: true,
  })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async surveyAssignation(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyAssignationService.findOne(id, user);
  }

  @Query(() => SurveyAssignationResultsEntity, { name: 'surveyAssignationFillResults' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async surveyAssignationFillResults(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyAssignationService.findFillResults(id, user);
  }

  @AllowAnonymous()
  @Query(() => SurveyInviteContextEntity, {
    name: 'surveyInviteByToken',
    nullable: true,
  })
  async surveyInviteByToken(@Args('token') token: string) {
    return this.surveyAssignationService.findInviteByToken(token);
  }

  @AllowAnonymous()
  @Mutation(() => SurveyFillSubmissionEntity)
  async submitSurveyFill(@Args('input') input: SubmitSurveyFillInput) {
    return this.surveyAssignationService.submitFill(input);
  }

  @Mutation(() => SurveyAssignationEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async createSurveyAssignation(
    @Args('input') input: CreateSurveyAssignationInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyAssignationService.create(input, user);
  }

  @Mutation(() => SurveyAssignationEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deleteSurveyAssignation(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyAssignationService.delete(id, user);
  }
}
