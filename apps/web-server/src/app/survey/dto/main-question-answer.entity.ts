import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MainQuestionAnswerEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  sortOrder?: number | null;

  @Field()
  value!: number;

  @Field({ nullable: true })
  reverseValue?: number | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
