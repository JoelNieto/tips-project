import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerNestedInput } from './answer-nested.input';

@InputType()
export class NewAnswerSetNestedInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field(() => [AnswerNestedInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerNestedInput)
  answers!: AnswerNestedInput[];
}
