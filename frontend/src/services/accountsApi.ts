import type { OperatorAccount, Order } from '../../../shared/types';
import { apiRequest } from '@/shared/api/client';

export interface CreateAccountInput {
  mobile: string;
  otp: string;
  whitelistCode?: string;
  deviceId?: string;
  model?: string;
}

export const accountsApi = {
  list() {
    return apiRequest<{ accounts: OperatorAccount[] }>('/api/accounts');
  },

  get(id: string) {
    return apiRequest<{ account: OperatorAccount }>(`/api/accounts/${id}`);
  },

  create(input: CreateAccountInput) {
    return apiRequest<{ account: OperatorAccount }>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiRequest<{ ok: true }>(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  syncOrders(id: string) {
    return apiRequest<{ inserted: number; skipped: number; orders: Order[] }>(`/api/accounts/${id}/sync-orders`, {
      method: 'POST',
    });
  },

  orders(id: string, status?: 'pending' | 'completed') {
    const query = status ? `?status=${status}` : '';
    return apiRequest<{ orders: Order[] }>(`/api/accounts/${id}/orders${query}`);
  },
};
