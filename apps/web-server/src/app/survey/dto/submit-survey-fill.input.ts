import { Field, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

@InputType()
export class SubmitSurveyMainAnswerInput {
  @Field(() => ID)
  @IsUUID()
  dimensionId!: string;

  @Field(() => ID)
  @IsUUID()
  mainQuestionAnswerId!: string;
}

@InputType()
export class SubmitSurveyQuestionAnswerInput {
  @Field(() => ID)
  @IsUUID()
  dimensionQuestionId!: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  answerIds!: string[];
}

@InputType()
export class SubmitSurveyFillInput {
  @Field()
  @IsString()
  token!: string;

  @Field(() => [SubmitSurveyMainAnswerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitSurveyMainAnswerInput)
  mainAnswers?: SubmitSurveyMainAnswerInput[];

  @Field(() => [SubmitSurveyQuestionAnswerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitSurveyQuestionAnswerInput)
  questionAnswers?: SubmitSurveyQuestionAnswerInput[];
}
