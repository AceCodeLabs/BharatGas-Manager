import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler, HttpError, notFound } from '../utils/http';
import { confirmDelivery, fetchOrders, syncLogin } from '../services/bharatgas.service';
import { OperatorAccount } from '../models/account.model';

const router = Router();

router.use(requireAuth);

router.post('/sync-login', asyncHandler(async (req, res) => {
  const { mobile, deviceId } = req.body;
  const data = await syncLogin(String(mobile || ''), String(deviceId || ''));
  res.json(data);
}));

router.post('/fetch-orders', asyncHandler<AuthRequest>(async (req, res) => {
  const { accountId } = req.body;
  const account = await OperatorAccount.findOne({ _id: accountId, ownerId: req.user._id });

  if (!account) throw notFound('Account not found');
  if (!account.bgToken) throw new HttpError(400, 'Account is missing bgToken. Re-link the account.');

  const orders = await fetchOrders(account.mobile, account.bgToken);
  res.json({ status: 'success', orders });
}));

router.post('/confirm-delivery', asyncHandler<AuthRequest>(async (req, res) => {
  const { orderId, accountId } = req.body;
  const account = await OperatorAccount.findOne({ _id: accountId, ownerId: req.user._id });

  if (!account) throw notFound('Account not found');
  if (!account.bgToken) throw new HttpError(400, 'Account is missing bgToken. Re-link the account.');

  const data = await confirmDelivery(String(orderId || ''), account.mobile, account.bgToken);
  res.json(data);
}));

export const bharatgasRoutes = router;
