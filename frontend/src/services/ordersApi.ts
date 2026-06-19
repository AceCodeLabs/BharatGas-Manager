import type { Order } from '../../../shared/types';
import { apiRequest } from '@/shared/api/client';

export const ordersApi = {
  list() {
    return apiRequest<{ orders: Order[] }>('/api/orders');
  },

  confirm(id: string) {
    return apiRequest<{ order: Order }>(`/api/orders/${id}/confirm`, {
      method: 'POST',
    });
  },
};
