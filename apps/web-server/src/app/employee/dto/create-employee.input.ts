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
export class CreateEmployeeInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  documentId!: string;

  @Field(() => Gender)
  @IsEnum(Gender)
  gender!: Gender;

  @Field()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @Field()
  @IsDateString()
  enrollmentDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  offDate?: string;

  @Field(() => EmployeeStatus)
  @IsEnum(EmployeeStatus)
  status!: EmployeeStatus;

  @Field(() => ID)
  @IsUUID()
  companyId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  positionId?: string;
}
