import { EntityBaseUser } from '../authentication';
import { Measure } from './measures.interface';
import { SurveyType } from './survey-type.interface';

export interface Survey extends EntityBaseUser {
  title: string;
  description: string;
  type: SurveyType;
  measures: Measure[];
  public: boolean;
  active: boolean;
  final: boolean;
}
