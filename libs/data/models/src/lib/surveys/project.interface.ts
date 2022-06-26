import { Company } from '../companies';
import { EntityBase } from '../data-models';

export interface Project extends EntityBase {
  title: string;
  code: string;
  description?: string;
  company?: Company;
  startDate: Date;
  endDate?: Date;
  active: boolean;
}
