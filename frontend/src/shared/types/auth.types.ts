export type UserRole = 'Admin' | 'Staff' | 'Customer';

export interface User {
  role: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  name: string;
}
