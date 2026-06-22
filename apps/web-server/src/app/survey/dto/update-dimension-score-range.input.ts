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

@ValidatorConstraint({ name: 'maxValueGteMinValueUpdate', async: false })
class MaxValueGteMinValueUpdateConstraint implements ValidatorConstraintInterface {
  validate(maxValue: number, args: ValidationArguments): boolean {
    const obj = args.object as { minValue?: number };
    if (obj.minValue === undefined) return true;
    return maxValue >= obj.minValue;
  }

  defaultMessage(): string {
    return 'maxValue must be greater than or equal to minValue';
  }
}

@InputType()
export class UpdateDimensionScoreRangeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  message?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Validate(MaxValueGteMinValueUpdateConstraint)
  maxValue?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;
}
