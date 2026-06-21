import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole } from '@generated/prisma';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  password!: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role!: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locale?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
