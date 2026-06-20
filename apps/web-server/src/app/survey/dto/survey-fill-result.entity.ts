import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SurveyFillAnswerResultEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field(() => Float)
  value!: number;
}

@ObjectType()
export class SurveyFillMainAnswerResultEntity {
  @Field(() => ID)
  dimensionId!: string;

  @Field()
  dimensionTitle!: string;

  @Field()
  answerText!: string;

  @Field(() => Float)
  answerValue!: number;
}

@ObjectType()
export class SurveyFillQuestionAnswerGroupEntity {
  @Field(() => ID)
  dimensionQuestionId!: string;

  @Field()
  questionText!: string;

  @Field(() => [SurveyFillAnswerResultEntity])
  answers!: SurveyFillAnswerResultEntity[];
}

@ObjectType()
export class SurveyFillResultEntity {
  @Field(() => ID)
  inviteeId!: string;

  @Field()
  inviteeEmail!: string;

  @Field({ nullable: true })
  inviteeName?: string | null;

  @Field()
  submittedAt!: Date;

  @Field(() => [SurveyFillMainAnswerResultEntity])
  mainAnswers!: SurveyFillMainAnswerResultEntity[];

  @Field(() => [SurveyFillQuestionAnswerGroupEntity])
  questionAnswers!: SurveyFillQuestionAnswerGroupEntity[];
}
