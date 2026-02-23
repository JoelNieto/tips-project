import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateDimensionQuestionOverridesInput {
  @Field()
  @IsString()
  dimensionQuestionId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  weightOverride?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isReversedOverride?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isMultiAnswerOverride?: boolean;
}
