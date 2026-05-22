import { Field, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateSurveyInviteeInput } from './create-survey-invitee.input';

@InputType()
export class CreateSurveyAssignationInput {
  @Field(() => ID)
  @IsUUID()
  surveyId!: string;

  @Field(() => ID)
  @IsUUID()
  companyId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  welcomeMessage?: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  expirationDate!: Date;

  @Field(() => [CreateSurveyInviteeInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyInviteeInput)
  invitees!: CreateSurveyInviteeInput[];
}
