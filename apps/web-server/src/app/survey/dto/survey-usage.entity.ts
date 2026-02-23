import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SurveyUsageEntity {
  @Field(() => ID)
  surveyId!: string;

  @Field()
  surveyTitle!: string;

  @Field(() => ID)
  dimensionId!: string;

  @Field()
  dimensionTitle!: string;
}
