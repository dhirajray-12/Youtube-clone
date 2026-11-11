import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { CLIENT_DIST, UPLOAD_DIR } from './config.js';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import commentRoutes from './routes/comments.js';
import channelRoutes from './routes/channels.js';
import meRoutes from './routes/me.js';

export function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // express.static supports HTTP range requests, so uploaded videos can be seeked.
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes(db));
  app.use('/api/videos', videoRoutes(db));
  app.use('/api/comments', commentRoutes(db));
  app.use('/api/channels', channelRoutes(db));
  app.use('/api/me', meRoutes(db));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // Serve the built React app in production.
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
  }

  app.use((err, _req, res, _next) => {
    const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
  });

  return app;
}
