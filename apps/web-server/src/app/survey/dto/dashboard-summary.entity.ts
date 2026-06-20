import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveSurveyWindowEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  surveyId!: string;

  @Field()
  surveyTitle!: string;

  @Field()
  companyName!: string;

  @Field()
  startDate!: Date;

  @Field()
  expirationDate!: Date;

  @Field(() => Int)
  inviteeCount!: number;
}

@ObjectType()
export class DashboardSummaryEntity {
  @Field(() => Int)
  companiesRegistered!: number;

  @Field(() => Int)
  numberOfSurveys!: number;

  @Field(() => Int)
  numberOfQuestions!: number;

  @Field(() => Int)
  numberOfSurveyAssignations!: number;

  @Field(() => [ActiveSurveyWindowEntity])
  activeSurveyWindows!: ActiveSurveyWindowEntity[];
}
