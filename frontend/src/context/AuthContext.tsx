import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, LoginDto } from '../shared/types/auth.types';
import { authService, getCurrentUser, setAuthSession } from '../services/api/authService';

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }
  const base64 = payload.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  try {
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = getCurrentUser();

    if (savedUser?.token && !isTokenExpired(savedUser.token)) {
      setUser(savedUser);
    } else {
      authService.logout();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    const payload = decodeJwtPayload(user.token);
    if (!payload?.exp) {
      return;
    }

    const timeout = Math.max(payload.exp * 1000 - Date.now(), 0);
    const timer = globalThis.setTimeout(() => {
      authService.logout();
      setUser(null);
    }, timeout);

    return () => globalThis.clearTimeout(timer);
  }, [user?.token]);

  const login = async (data: LoginDto) => {
    const res = await authService.login(data);
    setAuthSession(res);

    const user: User = {
      id: res.id,
      role: res.role,
      name: res.name,
      email: res.email,
      token: res.token,
      vehicleNumber: res.vehicleNumber,
      vehicleMake: res.vehicleMake,
      vehicleModel: res.vehicleModel,
      vehicleYear: res.vehicleYear,
      vehicleType: res.vehicleType,
    };

    setUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}