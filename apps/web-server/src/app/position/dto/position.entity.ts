import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PositionEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field(() => ID)
  companyId!: string;

  @Field(() => ID, { nullable: true })
  parentPositionId?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
