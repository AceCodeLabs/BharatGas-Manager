import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/http';
import { confirmDelivery, fetchOrders, syncLogin } from '../services/bharatgas.service';

const router = Router();

router.use(requireAuth);

router.post('/sync-login', asyncHandler(async (req, res) => {
  const { mobile, deviceId } = req.body;
  const data = await syncLogin(String(mobile || ''), String(deviceId || ''));
  res.json(data);
}));

router.post('/fetch-orders', asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  const orders = await fetchOrders(String(mobile || ''));
  res.json({ status: 'success', orders });
}));

router.post('/confirm-delivery', asyncHandler(async (req, res) => {
  const { orderId, accountMobile } = req.body;
  const data = await confirmDelivery(String(orderId || ''), String(accountMobile || ''));
  res.json(data);
}));

export const bharatgasRoutes = router;
