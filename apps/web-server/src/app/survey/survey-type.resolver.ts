import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { SurveyTypeEntity } from './dto/survey-type.entity';
import { CreateSurveyTypeInput } from './dto/create-survey-type.input';
import { UpdateSurveyTypeInput } from './dto/update-survey-type.input';
import { SurveyTypeService } from './survey-type.service';

@Resolver(() => SurveyTypeEntity)
export class SurveyTypeResolver {
  constructor(private readonly surveyTypeService: SurveyTypeService) {}

  @Query(() => [SurveyTypeEntity], { name: 'surveyTypes' })
  async surveyTypes(@Session() session: UserSession) {
    return this.surveyTypeService.findAll(session.user.id);
  }

  @Query(() => SurveyTypeEntity, { name: 'surveyType', nullable: true })
  async surveyType(@Args('id', { type: () => ID }) id: string) {
    return this.surveyTypeService.findOne(id);
  }

  @Mutation(() => SurveyTypeEntity)
  async createSurveyType(
    @Args('input') input: CreateSurveyTypeInput,
    @Session() session: UserSession
  ) {
    return this.surveyTypeService.create(input, session.user.id);
  }

  @Mutation(() => SurveyTypeEntity)
  async updateSurveyType(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSurveyTypeInput,
    @Session() session: UserSession
  ) {
    return this.surveyTypeService.update(id, input, session.user.id);
  }

  @Mutation(() => SurveyTypeEntity)
  async deleteSurveyType(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.surveyTypeService.delete(id, session.user.id);
  }
}
