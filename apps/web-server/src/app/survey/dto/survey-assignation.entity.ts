import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CompanyEntity } from '../../company/dto/company.entity';
import { UserEntity } from '../../company/dto/user.entity';
import { SurveyAssignationSurveySummaryEntity } from './survey-assignation-summary.entity';
import { SurveyInviteeEntity } from './survey-invitee.entity';

@ObjectType()
export class SurveyAssignationEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  surveyId!: string;

  @Field(() => SurveyAssignationSurveySummaryEntity, { nullable: true })
  survey?: SurveyAssignationSurveySummaryEntity | null;

  @Field(() => CompanyEntity)
  company!: CompanyEntity;

  @Field({ nullable: true })
  welcomeMessage?: string | null;

  @Field()
  startDate!: Date;

  @Field()
  expirationDate!: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserEntity)
  createdBy!: UserEntity;

  @Field(() => [SurveyInviteeEntity])
  invitees!: SurveyInviteeEntity[];

  @Field(() => Int, { nullable: true })
  inviteeCount?: number | null;
}
