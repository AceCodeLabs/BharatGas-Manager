import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler, HttpError, notFound } from '../utils/http';
import { fetchOrders, syncLogin } from '../services/bharatgas.service';
import { Order, toOrderDto, type OrderDocument } from '../models/order.model';
import { OperatorAccount, toAccountDto, type AccountDocument } from '../models/account.model';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler<AuthRequest>(async (req, res) => {
  const accounts = await OperatorAccount.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ accounts: accounts.map(account => toAccountDto(account as AccountDocument)) });
}));

router.post('/', asyncHandler<AuthRequest>(async (req, res) => {
  const mobile = String(req.body.mobile || '').trim();
  const otp = String(req.body.otp || '');
  const whitelistCode = String(req.body.whitelistCode || 'BG-998').trim().toUpperCase();

  if (!/^\d{10}$/.test(mobile)) throw new HttpError(400, 'A valid 10-digit mobile number is required');
  if (otp !== '123456' || whitelistCode !== 'BG-998') throw new HttpError(400, 'Invalid OTP or whitelist code');

  const deviceId = String(req.body.deviceId || `dev-${Math.random().toString(36).slice(2, 9)}`);
  const model = String(req.body.model || 'Generic Android');
  const login = await syncLogin(mobile, deviceId);

  const account = await OperatorAccount.create({
    mobile,
    name: login.operatorName,
    deviceModel: model,
    deviceId,
    status: 'Active',
    ownerId: req.user._id,
    whitelistCode,
    bgToken: login.token,
  });

  res.status(201).json({ account: toAccountDto(account as AccountDocument) });
}));

router.get('/:id', asyncHandler<AuthRequest>(async (req, res) => {
  const account = await OperatorAccount.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!account) throw notFound('Account not found');

  res.json({ account: toAccountDto(account as AccountDocument) });
}));

router.delete('/:id', asyncHandler<AuthRequest>(async (req, res) => {
  const deleted = await OperatorAccount.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
  if (!deleted) throw notFound('Account not found');

  res.json({ ok: true });
}));

router.get('/:id/orders', asyncHandler<AuthRequest>(async (req, res) => {
  const account = await OperatorAccount.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!account) throw notFound('Account not found');

  const filter: Record<string, unknown> = {
    accountId: account._id,
    ownerId: req.user._id,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter).sort({ orderId: -1 });
  res.json({ orders: orders.map(order => toOrderDto(order as OrderDocument)) });
}));

router.post('/:id/sync-orders', asyncHandler<AuthRequest>(async (req, res) => {
  const account = await OperatorAccount.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!account) throw notFound('Account not found');

  const externalOrders = await fetchOrders(account.mobile);
  const upsertedOrders: OrderDocument[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const externalOrder of externalOrders) {
    const result = await Order.updateOne(
      { ownerId: req.user._id, orderId: externalOrder.orderId },
      {
        $setOnInsert: {
          orderId: externalOrder.orderId,
          accountId: account._id,
          customer: externalOrder.customer,
          mobile: externalOrder.mobile,
          area: externalOrder.area,
          lpgId: externalOrder.lpgId || '',
          status: 'pending',
          points: externalOrder.points || 25,
          ownerId: req.user._id,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += 1;
    else skipped += 1;
  }

  const orderIds = externalOrders.map(order => order.orderId);
  const orders = await Order.find({
    ownerId: req.user._id,
    accountId: new Types.ObjectId(account._id),
    orderId: { $in: orderIds },
  });
  upsertedOrders.push(...orders.map(order => order as OrderDocument));

  res.json({
    inserted,
    skipped,
    orders: upsertedOrders.map(toOrderDto),
  });
}));

export const accountsRoutes = router;
