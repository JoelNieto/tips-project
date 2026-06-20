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

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;

  @Field({ nullable: true })
  categoryTitle?: string | null;

  @Field()
  answerText!: string;

  @Field(() => Float)
  answerValue!: number;
}

@ObjectType()
export class SurveyFillQuestionAnswerGroupEntity {
  @Field(() => ID)
  dimensionQuestionId!: string;

  @Field(() => ID)
  dimensionId!: string;

  @Field()
  dimensionTitle!: string;

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;

  @Field({ nullable: true })
  categoryTitle?: string | null;

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

@ObjectType()
export class SurveyTypeInfoResultEntity {
  @Field()
  hasCategories!: boolean;

  @Field()
  hasSubcategories!: boolean;

  @Field({ nullable: true })
  categoryName?: string | null;

  @Field({ nullable: true })
  subcategoryName?: string | null;

  @Field()
  visibleCategories!: boolean;

  @Field()
  visibleSubcategories!: boolean;
}

@ObjectType()
export class SurveyAssignationResultsEntity {
  @Field(() => SurveyTypeInfoResultEntity)
  surveyType!: SurveyTypeInfoResultEntity;

  @Field(() => [SurveyFillResultEntity])
  fills!: SurveyFillResultEntity[];
}
