import { EntityBase } from '../data-models';
import { Question } from './question.interface';

export interface Measure extends EntityBase {
  name: string;
  description?: string;
  weighting: number;
  subMeasure: Measure;
  mainQuestion: Question;
  questions: Question[];
}
