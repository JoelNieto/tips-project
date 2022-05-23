import { EntityBase } from '../data-models';
import { Role } from './roles-interface';

export interface User extends EntityBase {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export type EntityBaseUser = EntityBase & { createdBy: Omit<User, 'password'> };
