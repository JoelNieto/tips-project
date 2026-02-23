import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateSurveyInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @Field()
  @IsString()
  surveyTypeId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
