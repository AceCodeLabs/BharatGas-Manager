import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler, HttpError, notFound } from '../utils/http';
import { confirmDelivery } from '../services/bharatgas.service';
import { OperatorAccount } from '../models/account.model';
import { Transaction } from '../models/transaction.model';
import { Order, toOrderDto, type OrderDocument } from '../models/order.model';
import type { Order as OrderDto } from '../../../shared/types';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler<AuthRequest>(async (req, res) => {
  const orders = await Order.find({ ownerId: req.user._id }).sort({ orderId: -1 }).limit(50);
  res.json({ orders: orders.map(order => toOrderDto(order as OrderDocument)) });
}));

router.post('/:id/confirm', asyncHandler<AuthRequest>(async (req, res) => {
  const session = await mongoose.startSession();
  let confirmedOrder: OrderDto | null = null;
  let officialOrderId = '';
  let accountMobile = '';

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.id,
        ownerId: req.user._id,
      }).session(session);

      if (!order) throw notFound('Order not found');
      if (order.status === 'completed') throw new HttpError(409, 'Order already completed');

      const account = await OperatorAccount.findOne({
        _id: order.accountId,
        ownerId: req.user._id,
      }).session(session);

      if (!account) throw notFound('Account not found');
      accountMobile = account.mobile;

      const cost = Math.abs(order.points || 25);

      order.status = 'completed';
      order.completedAt = new Date();
      order.points = -cost;
      await order.save({ session });

      await Transaction.create([{
        type: 'debit',
        amount: cost,
        reason: `Order #${order.orderId} Confirmed`,
        account: account.mobile,
        ownerId: req.user._id,
      }], { session });

      officialOrderId = order.orderId;
      confirmedOrder = toOrderDto(order as OrderDocument);
    });
  } finally {
    await session.endSession();
  }

  if (!confirmedOrder) throw notFound('Order not found');

  await confirmDelivery(officialOrderId, accountMobile);
  res.json({ order: confirmedOrder });
}));

export const ordersRoutes = router;
