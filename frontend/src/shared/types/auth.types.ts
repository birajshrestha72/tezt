export type UserRole = 'Admin' | 'Staff' | 'Customer';

export interface User {
  id: number;
  role: UserRole;
  name: string;
  email?: string;
  fullName?: string;
  token?: string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleType?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  name: string;
  id: number;
  email?: string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleType?: string;
}
