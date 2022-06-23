import { Company } from '../companies/company';
import { Position } from '../companies/position';
import { EntityBase } from '../data-models';
import { User } from './user.interface';

export interface Profile extends EntityBase {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
  company: Company;
  position: Position;
  user: User;
}
