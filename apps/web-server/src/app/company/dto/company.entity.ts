import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from './user.entity';

@ObjectType()
export class CompanyEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  legalName?: string | null;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  email?: string | null;

  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  website?: string | null;

  @Field({ nullable: true })
  street?: string | null;

  @Field({ nullable: true })
  city?: string | null;

  @Field({ nullable: true })
  state?: string | null;

  @Field({ nullable: true })
  postalCode?: string | null;

  @Field({ nullable: true })
  country?: string | null;

  @Field({ nullable: true })
  taxId?: string | null;

  @Field({ nullable: true })
  logo?: string | null;

  @Field({ nullable: true })
  industry?: string | null;

  @Field({ nullable: true })
  size?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;
}
