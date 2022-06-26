import { Company } from '../companies/company';
import { Position } from '../companies/position';
import { EntityBase } from '../data-models';
import { User } from './user.interface';

export interface Profile extends EntityBase {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
  documentId: string;
  company: Company;
  position?: Position;
  active: boolean;
  user: User;
}
