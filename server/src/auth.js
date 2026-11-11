import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function readUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Attaches req.user when a valid token is present, but never rejects.
export function optionalAuth(req, _res, next) {
  req.user = readUser(req);
  next();
}

export function requireAuth(req, res, next) {
  req.user = readUser(req);
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}
