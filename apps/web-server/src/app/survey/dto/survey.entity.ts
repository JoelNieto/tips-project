import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../company/dto/user.entity';
import { DimensionEntity } from './dimension.entity';

@ObjectType()
export class SurveyEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  categoryName?: string | null;

  @Field({ nullable: true })
  subcategoryName?: string | null;

  @Field()
  hasCategories!: boolean;

  @Field()
  hasSubcategories!: boolean;

  @Field()
  visibleCategories!: boolean;

  @Field()
  visibleSubcategories!: boolean;

  @Field()
  randomizeQuestions!: boolean;

  @Field()
  presentAllQuestionsAtOnce!: boolean;

  @Field()
  allowPreviousQuestion!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;

  @Field(() => [DimensionEntity])
  dimensions!: DimensionEntity[];
}
