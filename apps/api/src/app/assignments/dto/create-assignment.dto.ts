import { Assignment, Company, Position, Profile, Project, Survey } from '@tips/data/models';

import { DTOBase } from '../../shared/base.schema';

export class CreateAssignmentDto implements DTOBase<Assignment> {
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
