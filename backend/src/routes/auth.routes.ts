import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { User, toUserDto, type UserDocument } from '../models/user.model';

const router = Router();

function signToken(user: UserDocument) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  } as jwt.SignOptions);
}

router.post('/register', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password || password.length < 6) {
    throw new HttpError(400, 'Email and a 6+ character password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Account already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });

  res.status(201).json({
    token: signToken(user as UserDocument),
    user: toUserDto(user as UserDocument),
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = await User.findOne({ email });
  if (!user) throw new HttpError(401, 'Invalid email or password');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new HttpError(401, 'Invalid email or password');

  res.json({
    token: signToken(user as UserDocument),
    user: toUserDto(user as UserDocument),
  });
}));

router.get('/me', requireAuth, asyncHandler<AuthRequest>(async (req, res) => {
  res.json({ user: toUserDto(req.user) });
}));

router.post('/logout', requireAuth, asyncHandler<AuthRequest>(async (_req, res) => {
  res.json({ ok: true });
}));

export const authRoutes = router;
