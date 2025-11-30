export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'USER' | 'ADMIN';
