import { EntityBase } from '../data-models';
import { Answer } from './answers.interface';

export interface AnswersSet extends EntityBase {
  name: string;
  answers: Answer[];
}
