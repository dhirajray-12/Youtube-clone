import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { VIDEO_SELECT } from '../db.js';
import { upload, publicPath, removeUpload } from '../upload.js';

export default function meRoutes(db) {
  const router = Router();
  router.use(requireAuth);

  router.get('/history', (req, res) => {
    const rows = db
      .prepare(
        `${VIDEO_SELECT.replace('FROM videos v', ', h.watched_at AS watchedAt FROM videos v')}
         JOIN history h ON h.video_id = v.id
         WHERE h.user_id = ? ORDER BY h.watched_at DESC LIMIT 200`,
      )
      .all(req.user.id);
    res.json(rows);
  });

  router.delete('/history', (req, res) => {
    db.prepare('DELETE FROM history WHERE user_id = ?').run(req.user.id);
    res.status(204).end();
  });

  router.get('/liked', (req, res) => {
    const rows = db
      .prepare(
        `${VIDEO_SELECT} JOIN likes l ON l.video_id = v.id
         WHERE l.user_id = ? AND l.value = 1 ORDER BY v.created_at DESC`,
      )
      .all(req.user.id);
    res.json(rows);
  });

  router.get('/videos', (req, res) => {
    const rows = db
      .prepare(
        `${VIDEO_SELECT.replace(
          'FROM videos v',
          `, (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id) AS commentCount,
             (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id AND l.value = 1) AS likes
           FROM videos v`,
        )}
         WHERE v.user_id = ? ORDER BY v.created_at DESC, v.id DESC`,
      )
      .all(req.user.id);
    res.json(rows);
  });

  router.get('/subscriptions', (req, res) => {
    const rows = db
      .prepare(
        `SELECT u.id, u.username, u.avatar_url AS avatarUrl,
                (SELECT COUNT(*) FROM subscriptions s2 WHERE s2.channel_id = u.id) AS subscriberCount
         FROM subscriptions s JOIN users u ON u.id = s.channel_id
         WHERE s.subscriber_id = ? ORDER BY u.username`,
      )
      .all(req.user.id);
    res.json(rows);
  });

  router.patch('/', upload.single('avatar'), (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    let avatar = user.avatar_url;
    if (req.file) {
      removeUpload(user.avatar_url);
      avatar = publicPath(req.file);
    }
    db.prepare('UPDATE users SET description = ?, avatar_url = ? WHERE id = ?').run(
      req.body?.description ?? user.description,
      avatar,
      user.id,
    );
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    res.json({
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        avatarUrl: updated.avatar_url,
        description: updated.description,
      },
    });
  });

  return router;
}
