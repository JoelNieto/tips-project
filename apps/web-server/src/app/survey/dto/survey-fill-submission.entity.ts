import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SurveyFillSubmissionEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  surveyId!: string;

  @Field(() => ID)
  inviteeId!: string;

  @Field()
  submittedAt!: Date;
}
