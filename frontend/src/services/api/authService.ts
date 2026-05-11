import api from './axios';
import { LoginDto, AuthResponse } from '../../shared/types/auth.types';

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('wm_token');
    localStorage.removeItem('wm_user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('wm_user');

      if (!user || user === 'undefined') {
        return null;
      }

      return JSON.parse(user);
    } catch (error) {
      console.error('Invalid user in localStorage:', error);

      localStorage.removeItem('wm_user');

      return null;
    }
  }
};