import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../company/dto/user.entity';
import { AnswerEntity } from './answer.entity';

@ObjectType()
export class QuestionEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  weight?: number | null;

  @Field()
  isReversed!: boolean;

  @Field()
  isMultiAnswer!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;

  @Field(() => [AnswerEntity])
  answers!: AnswerEntity[];
}
