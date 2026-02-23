import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class AnswerNestedInput {
  @Field()
  @IsString()
  @MinLength(1)
  text!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @Field()
  @IsNumber()
  value!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  reverseValue?: number;
}
