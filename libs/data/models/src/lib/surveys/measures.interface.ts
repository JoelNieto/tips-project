import { EntityBase } from '../data-models';
import { Question } from './question.interface';

export interface Measure extends EntityBase {
  name: string;
  description?: string;
  weighting: number;
  subMeasures: Measure[];
  mainQuestion: Question;
  questions: Question[];
}
