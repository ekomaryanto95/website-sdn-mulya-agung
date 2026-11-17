import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const TOKEN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'sdn-mulya-agung-lalan-muba-session-key-2026';

export interface SessionPayload {
  userId: number;
  username: string;
  role: 'super_admin' | 'operator_sekolah';
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: SessionPayload;
}

export function hashPassword(password: string, existingSalt?: string): {
  salt: string;
  hash: string;
} {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHash, 'hex');
  if (derived.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, expectedBuf);
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Akses ditolak. Silakan login sebagai administrator terlebih dahulu.',
    });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Sesi admin tidak valid atau telah berakhir. Silakan login ulang.',
    });
    return;
  }

  req.adminUser = payload;
  next();
}
