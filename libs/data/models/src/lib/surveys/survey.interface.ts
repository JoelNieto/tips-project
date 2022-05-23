import { EntityBaseUser } from '../authentication';
import { Measure } from './measures.interface';
import { SurveyCategory } from './survey-category.interface';

export interface Survey extends EntityBaseUser {
  title: string;
  description: string;
  category: SurveyCategory;
  measures: Measure[];
  public: boolean;
  active: boolean;
  final: boolean;
}
