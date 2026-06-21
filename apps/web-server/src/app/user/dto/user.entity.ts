import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from '@generated/prisma';

@ObjectType()
export class UserEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field({ nullable: true })
  locale?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
