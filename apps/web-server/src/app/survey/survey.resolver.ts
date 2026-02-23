import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { SurveyEntity } from './dto/survey.entity';
import { CreateSurveyInput } from './dto/create-survey.input';
import { UpdateSurveyInput } from './dto/update-survey.input';
import { SurveyService } from './survey.service';

@Resolver(() => SurveyEntity)
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Query(() => [SurveyEntity], { name: 'surveys' })
  async surveys(@Session() session: UserSession) {
    return this.surveyService.findAll(session.user.id);
  }

  @Query(() => SurveyEntity, { name: 'survey', nullable: true })
  async survey(@Args('id', { type: () => ID }) id: string) {
    return this.surveyService.findOne(id);
  }

  @Mutation(() => SurveyEntity)
  async createSurvey(
    @Args('input') input: CreateSurveyInput,
    @Session() session: UserSession
  ) {
    return this.surveyService.create(input, session.user.id);
  }

  @Mutation(() => SurveyEntity)
  async updateSurvey(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSurveyInput,
    @Session() session: UserSession
  ) {
    return this.surveyService.update(id, input, session.user.id);
  }

  @Mutation(() => SurveyEntity)
  async deleteSurvey(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.surveyService.delete(id, session.user.id);
  }
}
