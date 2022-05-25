import { EntityBase } from '../data-models';
import { AnswersSet } from './answers-set.interface';

export interface Question extends EntityBase {
  title: string;
  text: string;
  reverse: boolean;
  weighting: number;
  multiAnswer: boolean;
  answersSet: AnswersSet;
}
