import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/http';
import { OperatorAccount } from '../models/account.model';
import { Order, toOrderDto, type OrderDocument } from '../models/order.model';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler<AuthRequest>(async (req, res) => {
  const [accounts, pendingOrders, completedOrders, recentOrders] = await Promise.all([
    OperatorAccount.find({ ownerId: req.user._id }),
    Order.countDocuments({ ownerId: req.user._id, status: 'pending' }),
    Order.countDocuments({ ownerId: req.user._id, status: 'completed' }),
    Order.find({ ownerId: req.user._id }).sort({ orderId: -1 }).limit(4),
  ]);

  res.json({
    totalAccounts: accounts.length,
    activeSessions: accounts.filter(account => account.status === 'Active').length,
    pendingOrders,
    completedOrders,
    recentOrders: recentOrders.map(order => toOrderDto(order as OrderDocument)),
  });
}));

export const dashboardRoutes = router;
