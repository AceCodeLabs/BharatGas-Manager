import type { Transaction } from '../../../shared/types';
import { apiRequest } from '@/shared/api/client';

export const transactionsApi = {
  list() {
    return apiRequest<{ transactions: Transaction[] }>('/api/transactions');
  },
};
