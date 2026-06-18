import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreatePositionInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @Field(() => ID)
  @IsUUID()
  companyId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentPositionId?: string;
}
