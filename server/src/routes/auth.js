import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, signToken } from '../auth.js';

export default function authRoutes(db) {
  const router = Router();

  const publicUser = (u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatarUrl: u.avatar_url,
    description: u.description,
  });

  router.post('/register', (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      return res.status(400).json({ error: 'Username must be 3-30 letters, numbers or underscores' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const exists = db
      .prepare('SELECT 1 FROM users WHERE username = ? OR email = ?')
      .get(username.trim(), email.trim());
    if (exists) return res.status(409).json({ error: 'Username or email already taken' });

    const hash = bcrypt.hashSync(password, 10);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username.trim(), email.trim(), hash);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  });

  router.post('/login', (req, res) => {
    const { login, password } = req.body || {};
    const user = db
      .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
      .get(login || '', login || '');
    if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  router.get('/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  });

  return router;
}
