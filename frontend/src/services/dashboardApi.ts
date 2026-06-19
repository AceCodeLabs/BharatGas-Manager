import type { DashboardStats } from '../../../shared/types';
import { apiRequest } from '@/shared/api/client';

export const dashboardApi = {
  get() {
    return apiRequest<DashboardStats>('/api/dashboard');
  },
};
