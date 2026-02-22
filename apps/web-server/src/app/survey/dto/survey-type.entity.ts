import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from './user.entity';

@ObjectType()
export class SurveyTypeEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  code?: string | null;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  sortOrder?: number | null;

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
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;
}
