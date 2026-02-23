import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../company/dto/user.entity';
import { SurveyTypeEntity } from './survey-type.entity';
import { DimensionEntity } from './dimension.entity';

@ObjectType()
export class SurveyEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => SurveyTypeEntity)
  surveyType!: SurveyTypeEntity;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;

  @Field(() => [DimensionEntity])
  dimensions!: DimensionEntity[];
}
