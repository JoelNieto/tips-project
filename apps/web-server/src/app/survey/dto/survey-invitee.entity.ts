import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmployeeEntity } from '../../employee/dto/employee.entity';

@ObjectType()
export class SurveyInviteeFillSummaryEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  submittedAt!: Date;
}

@ObjectType()
export class SurveyInviteeEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name?: string | null;

  @Field(() => ID, { nullable: true })
  employeeId?: string | null;

  @Field(() => EmployeeEntity, { nullable: true })
  employee?: EmployeeEntity | null;

  @Field()
  token!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => SurveyInviteeFillSummaryEntity, { nullable: true })
  fill?: SurveyInviteeFillSummaryEntity | null;
}
