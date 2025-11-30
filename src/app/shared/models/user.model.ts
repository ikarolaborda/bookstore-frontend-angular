import { UserRole } from './auth.model';

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  enabled: boolean;
}

export type { User, UserRole } from './auth.model';
