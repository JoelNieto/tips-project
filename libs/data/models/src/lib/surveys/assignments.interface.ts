import { Profile } from '../authentication';
import { Company, Position } from '../companies';
import { EntityBase } from '../data-models';
import { Project } from './project.interface';
import { Survey } from './survey.interface';

export interface Assignment extends EntityBase {
  title: string;
  description?: string;
  project?: Project;
  company?: Company;
  startDate: Date;
  endDate?: Date;
  survey?: Survey;
  positions: Position[];
  profiles: Profile[];
}
