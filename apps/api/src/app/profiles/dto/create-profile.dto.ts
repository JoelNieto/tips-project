import { ApiProperty } from '@nestjs/swagger';
import { Company, Position, Profile } from '@tips/data/models';
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DTOBase } from '../../shared/base.schema';

export class CreateProfileDto implements DTOBase<Omit<Profile, 'user'>> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsString()
  @IsNotEmpty()
  gender: 'male' | 'female' | 'other';

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty()
  @IsNotEmpty()
  company: Company;

  @ApiProperty()
  @IsNotEmpty()
  position?: Position;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
