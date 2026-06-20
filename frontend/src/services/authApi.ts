import type { UserProfile } from '../../../shared/types';
import { apiRequest } from '@/shared/api/client';

interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  },

  register(email: string, password: string) {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      data: { email, password },
    });
  },

  me() {
    return apiRequest<{ user: UserProfile }>('/api/auth/me');
  },
};
