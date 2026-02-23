import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AnswerEntity } from './answer.entity';

@ObjectType()
export class DimensionQuestionAnswerEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => AnswerEntity)
  answer!: AnswerEntity;

  @Field({ nullable: true })
  valueOverride?: number | null;

  @Field({ nullable: true })
  reverseValueOverride?: number | null;

  @Field({ nullable: true })
  orderOverride?: number | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
