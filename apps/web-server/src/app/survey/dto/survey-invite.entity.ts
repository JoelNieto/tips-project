import { Field, ObjectType } from '@nestjs/graphql';
import { SurveyEntity } from './survey.entity';

@ObjectType()
export class SurveyInviteContextEntity {
  @Field()
  token!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name?: string | null;

  @Field({ nullable: true })
  welcomeMessage?: string | null;

  @Field({ nullable: true })
  companyName?: string | null;

  @Field()
  startDate!: Date;

  @Field()
  expirationDate!: Date;

  @Field(() => SurveyEntity)
  survey!: SurveyEntity;
}
