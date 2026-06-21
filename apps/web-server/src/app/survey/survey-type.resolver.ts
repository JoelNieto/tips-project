import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { SurveyTypeEntity } from './dto/survey-type.entity';
import { CreateSurveyTypeInput } from './dto/create-survey-type.input';
import { UpdateSurveyTypeInput } from './dto/update-survey-type.input';
import { SurveyTypeService } from './survey-type.service';

@Resolver(() => SurveyTypeEntity)
@UseGuards(RolesGuard)
export class SurveyTypeResolver {
  constructor(
    private readonly surveyTypeService: SurveyTypeService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [SurveyTypeEntity], { name: 'surveyTypes' })
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async surveyTypes(@Session() session: UserSession) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyTypeService.findAll(user);
  }

  @Query(() => SurveyTypeEntity, { name: 'surveyType', nullable: true })
  async surveyType(@Args('id', { type: () => ID }) id: string) {
    return this.surveyTypeService.findOne(id);
  }

  @Mutation(() => SurveyTypeEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async createSurveyType(
    @Args('input') input: CreateSurveyTypeInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.surveyTypeService.create(input, user.id);
  }

  @Mutation(() => SurveyTypeEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async updateSurveyType(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSurveyTypeInput,
    @Session() session: UserSession
  ) {
    return this.surveyTypeService.update(id, input, session.user.id);
  }

  @Mutation(() => SurveyTypeEntity)
  @Roles(UserRole.ADMIN, UserRole.DESIGNER)
  async deleteSurveyType(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.surveyTypeService.delete(id, session.user.id);
  }
}
