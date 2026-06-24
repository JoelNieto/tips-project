import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { DimensionScoreRangeEntity } from './dimension-score-range.entity';

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
export class SurveyAssignationResultsEntity {
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

  @Field({ nullable: true })
  surveyTitle?: string | null;

  @Field({ nullable: true })
  companyName?: string | null;

  @Field({ nullable: true })
  companyLogo?: string | null;

  @Field({ nullable: true })
  assignationStartDate?: Date | null;

  @Field({ nullable: true })
  assignationExpirationDate?: Date | null;

  @Field(() => [SurveyResultDimensionEntity])
  dimensions!: SurveyResultDimensionEntity[];

  @Field(() => [SurveyFillResultEntity])
  fills!: SurveyFillResultEntity[];
}

@ObjectType()
export class SurveyResultDimensionEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => [DimensionScoreRangeEntity])
  scoreRanges!: DimensionScoreRangeEntity[];
}
