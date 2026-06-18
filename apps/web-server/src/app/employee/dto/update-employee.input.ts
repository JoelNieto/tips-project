import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmployeeStatus } from './employee-status.enum';
import { Gender } from './gender.enum';

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  documentId?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  offDate?: string;

  @Field(() => EmployeeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  positionId?: string;
}
