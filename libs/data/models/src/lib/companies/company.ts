import { EntityBase } from '../data-models';

export interface Company extends EntityBase {
  name: string;
  fullName: string;
  notes?: string;
}
