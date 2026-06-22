import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DimensionScoreRangeEntity {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  label?: string | null;

  @Field()
  message!: string;

  @Field(() => Float)
  minValue!: number;

  @Field(() => Float)
  maxValue!: number;

  @Field(() => Int, { nullable: true })
  order?: number | null;
}
