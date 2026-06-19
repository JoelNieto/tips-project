import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NewAnswerSetNestedInput } from './new-answer-set-nested.input';

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @Field()
  @IsString()
  @MinLength(1)
  text!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isReversed?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isMultiAnswer?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  answerSetId?: string;

  @Field(() => NewAnswerSetNestedInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewAnswerSetNestedInput)
  newAnswerSet?: NewAnswerSetNestedInput;
}
