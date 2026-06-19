import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../company/dto/user.entity';
import { AnswerEntity } from './answer.entity';

@ObjectType()
export class AnswerSetEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;

  @Field(() => [AnswerEntity])
  answers!: AnswerEntity[];
}
