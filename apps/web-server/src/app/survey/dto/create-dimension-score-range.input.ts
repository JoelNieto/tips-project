import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxValueGteMinValue', async: false })
class MaxValueGteMinValueConstraint implements ValidatorConstraintInterface {
  validate(maxValue: number, args: ValidationArguments): boolean {
    const obj = args.object as { minValue?: number };
    return obj.minValue === undefined || maxValue >= obj.minValue;
  }

  defaultMessage(): string {
    return 'maxValue must be greater than or equal to minValue';
  }
}

@InputType()
export class CreateDimensionScoreRangeInput {
  @Field()
  @IsString()
  dimensionId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field()
  @IsString()
  @MinLength(1)
  message!: string;

  @Field(() => Float)
  @IsNumber()
  minValue!: number;

  @Field(() => Float)
  @IsNumber()
  @Validate(MaxValueGteMinValueConstraint)
  maxValue!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;
}
