import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AllowAnonymous, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { SurveyAssignationEntity } from './dto/survey-assignation.entity';
import { CreateSurveyAssignationInput } from './dto/create-survey-assignation.input';
import { SurveyInviteContextEntity } from './dto/survey-invite.entity';
import { SurveyAssignationService } from './survey-assignation.service';

@Resolver(() => SurveyAssignationEntity)
export class SurveyAssignationResolver {
  constructor(
    private readonly surveyAssignationService: SurveyAssignationService
  ) {}

  @Query(() => [SurveyAssignationEntity], { name: 'surveyAssignations' })
  async surveyAssignations(
    @Args('surveyId', { type: () => ID }) surveyId: string,
    @Session() session: UserSession
  ) {
    return this.surveyAssignationService.findBySurvey(
      surveyId,
      session.user.id
    );
  }

  @Query(() => SurveyAssignationEntity, {
    name: 'surveyAssignation',
    nullable: true,
  })
  async surveyAssignation(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.surveyAssignationService.findOne(id, session.user.id);
  }

  @AllowAnonymous()
  @Query(() => SurveyInviteContextEntity, {
    name: 'surveyInviteByToken',
    nullable: true,
  })
  async surveyInviteByToken(@Args('token') token: string) {
    return this.surveyAssignationService.findInviteByToken(token);
  }

  @Mutation(() => SurveyAssignationEntity)
  async createSurveyAssignation(
    @Args('input') input: CreateSurveyAssignationInput,
    @Session() session: UserSession
  ) {
    return this.surveyAssignationService.create(input, session.user.id);
  }

  @Mutation(() => SurveyAssignationEntity)
  async deleteSurveyAssignation(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.surveyAssignationService.delete(id, session.user.id);
  }
}
