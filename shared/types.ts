export type AccountStatus = 'Active' | 'Offline' | 'Sync Required';
export type OrderStatus = 'pending' | 'completed';
export type TransactionType = 'credit' | 'debit';

export interface UserProfile {
  id: string;
  email: string;
}

export interface OperatorAccount {
  id: string;
  mobile: string;
  name: string;
  deviceId: string;
  model: string;
  status: AccountStatus;
  whitelistCode?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderId: string;
  accountId: string;
  customer: string;
  mobile: string;
  area?: string;
  lpgId?: string;
  status: OrderStatus;
  points: number;
  completedAt?: string | null;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  reason: string;
  account?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalAccounts: number;
  activeSessions: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Order[];
}
