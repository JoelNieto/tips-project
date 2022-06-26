import { EntityBase } from '../data-models';
import { Company } from './company';

export interface Position extends EntityBase {
  company: Company;
  code: string;
  name: string;
  isPosition: boolean;
  children: Position[];
  parent: Position;
}
