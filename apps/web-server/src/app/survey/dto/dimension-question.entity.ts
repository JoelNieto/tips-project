import { Field, ID, ObjectType } from '@nestjs/graphql';
import { QuestionEntity } from './question.entity';
import { DimensionQuestionAnswerEntity } from './dimension-question-answer.entity';

@ObjectType()
export class DimensionQuestionEntity {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  order?: number | null;

  @Field({ nullable: true })
  weightOverride?: number | null;

  @Field({ nullable: true })
  isReversedOverride?: boolean | null;

  @Field({ nullable: true })
  isMultiAnswerOverride?: boolean | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => QuestionEntity)
  question!: QuestionEntity;

  @Field(() => [DimensionQuestionAnswerEntity])
  answerOverrides!: DimensionQuestionAnswerEntity[];
}
