import { Router } from 'express';
import { optionalAuth, requireAuth } from '../auth.js';
import { VIDEO_SELECT } from '../db.js';

export default function channelRoutes(db) {
  const router = Router();

  router.get('/:id', optionalAuth, (req, res) => {
    const user = db
      .prepare(
        `SELECT id, username, avatar_url AS avatarUrl, banner_color AS bannerColor,
                description, created_at AS createdAt
         FROM users WHERE id = ?`,
      )
      .get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Channel not found' });

    const subscriberCount = db
      .prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE channel_id = ?')
      .get(user.id).n;
    const stats = db
      .prepare('SELECT COUNT(*) AS videoCount, COALESCE(SUM(views), 0) AS totalViews FROM videos WHERE user_id = ?')
      .get(user.id);
    const videos = db
      .prepare(`${VIDEO_SELECT} WHERE v.user_id = ? ORDER BY v.created_at DESC, v.id DESC`)
      .all(user.id);
    const subscribed = req.user
      ? !!db
          .prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?')
          .get(req.user.id, user.id)
      : false;

    res.json({ ...user, ...stats, subscriberCount, subscribed, videos });
  });

  // Toggle subscription
  router.post('/:id/subscribe', requireAuth, (req, res) => {
    const channelId = Number(req.params.id);
    if (channelId === req.user.id) {
      return res.status(400).json({ error: "You can't subscribe to your own channel" });
    }
    if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(channelId)) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    const existing = db
      .prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?')
      .get(req.user.id, channelId);
    if (existing) {
      db.prepare('DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?').run(
        req.user.id,
        channelId,
      );
    } else {
      db.prepare('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)').run(
        req.user.id,
        channelId,
      );
    }
    const subscriberCount = db
      .prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE channel_id = ?')
      .get(channelId).n;
    res.json({ subscribed: !existing, subscriberCount });
  });

  return router;
}
