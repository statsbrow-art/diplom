import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { env } from './env.js';
import { prisma } from './db.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, options);
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.blocked) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
