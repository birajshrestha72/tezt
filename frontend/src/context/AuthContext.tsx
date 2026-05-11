import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto } from '../shared/types/auth.types';
import { authService } from '../services/api/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();

    if (savedUser) {
      setUser(savedUser);
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginDto) => {
    try {
      const res = await authService.login(data);

      localStorage.setItem('wm_token', res.token);

      const user: User = {
        role: res.role,
        name: res.name,
      };

      localStorage.setItem('wm_user', JSON.stringify(user));

      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}