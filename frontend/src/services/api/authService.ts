import api from './axios';
import { LoginDto, AuthResponse, User } from '../../shared/types/auth.types';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

const isBrowser = (globalThis as any) !== undefined && 'localStorage' in (globalThis as any);

function persist(value: string | null, key: string) {
  if (!isBrowser) return;
  if (value === null) {
    globalThis.localStorage.removeItem(key);
    return;
  }

  globalThis.localStorage.setItem(key, value);
}

function readJson<T>(key: string): T | null {
  if (!isBrowser) return null;

  const raw = globalThis.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setAuthSession(response: AuthResponse) {
  const user: User = {
    id: response.id,
    role: response.role,
    name: response.name,
    email: response.email,
    token: response.token,
    vehicleNumber: response.vehicleNumber,
    vehicleMake: response.vehicleMake,
    vehicleModel: response.vehicleModel,
    vehicleYear: response.vehicleYear,
    vehicleType: response.vehicleType,
  };

  persist(response.token, AUTH_TOKEN_KEY);
  persist(JSON.stringify(user), AUTH_USER_KEY);
}

export function clearAuthSession() {
  persist(null, AUTH_TOKEN_KEY);
  persist(null, AUTH_USER_KEY);
}

export function getAuthToken() {
  if (!isBrowser) return null;
  return globalThis.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getCurrentUser() {
  return readJson<User>(AUTH_USER_KEY);
}

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  register: async (data: Record<string, unknown>): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', data);
    return response.data.data;
  },

  logout: () => {
    clearAuthSession();
  }
};