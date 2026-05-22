import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SurveyAssignationSurveySummaryEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;
}
