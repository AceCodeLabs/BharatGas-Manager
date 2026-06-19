import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/http';
import { Transaction, toTransactionDto, type TransactionDocument } from '../models/transaction.model';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler<AuthRequest>(async (req, res) => {
  const transactions = await Transaction.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ transactions: transactions.map(tx => toTransactionDto(tx as TransactionDocument)) });
}));

export const transactionsRoutes = router;
