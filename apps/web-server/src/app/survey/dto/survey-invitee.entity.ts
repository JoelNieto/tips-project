import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SurveyInviteeFillSummaryEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  submittedAt!: Date;
}

@ObjectType()
export class SurveyInviteeEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name?: string | null;

  @Field()
  token!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => SurveyInviteeFillSummaryEntity, { nullable: true })
  fill?: SurveyInviteeFillSummaryEntity | null;
}
