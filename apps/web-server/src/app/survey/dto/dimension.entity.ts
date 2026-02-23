import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MainQuestionAnswerEntity } from './main-question-answer.entity';
import { DimensionQuestionEntity } from './dimension-question.entity';

@ObjectType()
export class DimensionEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  weighting?: number | null;

  @Field({ nullable: true })
  mainQuestionText?: string | null;

  @Field({ nullable: true })
  order?: number | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => [MainQuestionAnswerEntity])
  mainQuestionAnswers!: MainQuestionAnswerEntity[];

  @Field(() => [DimensionQuestionEntity])
  dimensionQuestions!: DimensionQuestionEntity[];

  @Field(() => [DimensionEntity], { nullable: true })
  subdimensions?: DimensionEntity[];
}
