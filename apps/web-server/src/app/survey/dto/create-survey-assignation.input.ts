import { Field, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
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

  @Field(() => [CreateSurveyInviteeInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyInviteeInput)
  invitees?: CreateSurveyInviteeInput[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  employeeIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  positionIds?: string[];
}
