import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateSurveyTypeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategoryName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hasCategories?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hasSubcategories?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  visibleCategories?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  visibleSubcategories?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;
}
