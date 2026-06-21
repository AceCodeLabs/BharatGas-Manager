import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler, HttpError, notFound } from '../utils/http';
import { BpclApiError, fetchOrders, sendOtp, validateOtp, verifyUser } from '../services/bharatgas.service';
import { Order, toOrderDto, type OrderDocument } from '../models/order.model';
import { OperatorAccount, toAccountDto, type AccountDocument } from '../models/account.model';

const router = Router();

router.use(requireAuth);

function toBpclHttpError(error: BpclApiError) {
  const message = error.status === 401
    ? 'BPCL rejected the request. The account bgToken is missing, expired, or invalid.'
    : error.message;

  return new HttpError(424, message);
}

function getStringField(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return '';
}

router.get('/', asyncHandler<AuthRequest>(async (req, res) => {
  const accounts = await OperatorAccount.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ accounts: accounts.map(account => toAccountDto(account as AccountDocument)) });
}));

router.post('/send-otp', asyncHandler<AuthRequest>(async (req, res) => {
  const mobile = String(req.body.mobile || '').trim();

  if (!/^\d{10}$/.test(mobile)) throw new HttpError(400, 'A valid 10-digit mobile number is required');

  try {
    // const verification = await verifyUser(mobile);

    // if (verification.registered === false) {
    //   throw new HttpError(404, verification.message || 'This mobile number does not exist as a HelloBPCL user');
    // }

    const otp = await sendOtp(mobile);
    if (!otp.otpAuthToken) throw new HttpError(502, 'BPCL did not return an OTP auth token');

    res.json({
      ok: true,
      // verification,
      otpAuthToken: otp.otpAuthToken,
      otpTimeStamp: otp.otpTimeStamp,
      message: otp.message,
    });
  } catch (error) {
    if (error instanceof BpclApiError) throw toBpclHttpError(error);
    throw error;
  }
}));

router.post('/', asyncHandler<AuthRequest>(async (req, res) => {
  const mobile = String(req.body.mobile || '').trim();
  const otp = String(req.body.otp || '');
  const otpAuthToken = String(req.body.otpAuthToken || '');
  const whitelistCode = String(req.body.whitelistCode || 'BG-998').trim().toUpperCase();

  if (!/^\d{10}$/.test(mobile)) throw new HttpError(400, 'A valid 10-digit mobile number is required');
  if (!/^\d{6}$/.test(otp) || whitelistCode !== 'BG-998') throw new HttpError(400, 'Invalid OTP or whitelist code');
  if (!otpAuthToken) throw new HttpError(400, 'OTP auth token is required. Send OTP again.');

  const deviceId = String(req.body.deviceId || `dev-${Math.random().toString(36).slice(2, 9)}`);
  const model = String(req.body.model || 'Generic Android');
  let login: Record<string, unknown>;

  try {
    login = await validateOtp(mobile, otp, otpAuthToken, deviceId);
  } catch (error) {
    if (error instanceof BpclApiError) throw toBpclHttpError(error);
    throw error;
  }

  const account = await OperatorAccount.create({
    mobile,
    name: getStringField(login, ['operatorName', 'customerName', 'name', 'firstName']) || 'BPCL User',
    deviceModel: model,
    deviceId,
    status: 'Active',
    ownerId: req.user._id,
    whitelistCode,
    bgToken: getStringField(login, ['token', 'accessToken', 'access_token', 'authToken']),
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
  if (!account.bgToken) throw new HttpError(400, 'Account is missing bgToken. Re-link the account.');

  const externalOrders = await fetchOrders(account.mobile, account.bgToken);
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
