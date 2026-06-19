import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../utils/http';
import { User, type UserDocument } from '../models/user.model';

export interface AuthRequest extends Request {
  user: UserDocument;
}

interface JwtPayload {
  sub: string;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) throw new HttpError(401, 'Missing authorization token');

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(payload.sub);

    if (!user) throw new HttpError(401, 'Invalid authorization token');

    (req as AuthRequest).user = user as UserDocument;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(new HttpError(401, 'Invalid authorization token'));
  }
}
