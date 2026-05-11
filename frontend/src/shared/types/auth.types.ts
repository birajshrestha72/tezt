export type UserRole = 'Admin' | 'Staff' | 'Customer';

export interface User {
  role: UserRole;
  name: string;
  email?: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  name: string;
}
