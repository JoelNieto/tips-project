import { EntityBaseUser } from '../authentication';

export interface SurveyType extends EntityBaseUser {
  name: string;
  hasRadar: boolean;
  hasBar: boolean;
  hasMeasureQuestion: boolean;
  prefix: string;
  measureName: string;
  subMeasureName: string;
  visibleMeasures: boolean;
  instructions?: string;
  isRandom: boolean;
}
