import { Field, InputType } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateDimensionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  weighting?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mainQuestionText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;
}
