import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PositionEntity } from '../../position/dto/position.entity';
import { EmployeeStatus } from './employee-status.enum';
import { Gender } from './gender.enum';

@ObjectType()
export class EmployeeEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  documentId!: string;

  @Field(() => Gender)
  gender!: Gender;

  @Field()
  email!: string;

  @Field({ nullable: true })
  birthdate?: Date | null;

  @Field()
  enrollmentDate!: Date;

  @Field({ nullable: true })
  offDate?: Date | null;

  @Field(() => EmployeeStatus)
  status!: EmployeeStatus;

  @Field(() => ID)
  companyId!: string;

  @Field(() => ID, { nullable: true })
  positionId?: string | null;

  @Field(() => PositionEntity, { nullable: true })
  position?: PositionEntity | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
