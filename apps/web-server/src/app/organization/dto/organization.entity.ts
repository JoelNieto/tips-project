import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../user/dto/user.entity';

@ObjectType()
export class OrganizationEntity {
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
}

@ObjectType()
export class OrganizationSurveyEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organizationId!: string;

  @Field(() => ID)
  surveyId!: string;

  @Field()
  createdAt!: Date;
}
