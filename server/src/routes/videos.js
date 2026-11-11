import { Router } from 'express';
import { optionalAuth, requireAuth } from '../auth.js';
import { VIDEO_SELECT } from '../db.js';
import { upload, publicPath, removeUpload } from '../upload.js';

const SORTS = {
  latest: 'v.created_at DESC, v.id DESC',
  popular: 'v.views DESC',
  oldest: 'v.created_at ASC, v.id ASC',
};

export default function videoRoutes(db) {
  const router = Router();

  const getVideo = (id) => db.prepare(`${VIDEO_SELECT} WHERE v.id = ?`).get(id);

  // List / search videos
  router.get('/', (req, res) => {
    const { q, category, sort = 'latest' } = req.query;
    const limit = Math.min(Number(req.query.limit) || 48, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const where = [];
    const params = [];
    if (q) {
      where.push('(v.title LIKE ? OR v.description LIKE ? OR u.username LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (category && category !== 'All') {
      where.push('v.category = ?');
      params.push(category);
    }
    const sql = `${VIDEO_SELECT}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${SORTS[sort] || SORTS.latest}
      LIMIT ? OFFSET ?`;
    res.json(db.prepare(sql).all(...params, limit, offset));
  });

  router.get('/categories', (_req, res) => {
    const rows = db
      .prepare('SELECT category, COUNT(*) AS count FROM videos GROUP BY category ORDER BY count DESC')
      .all();
    res.json(rows.map((r) => r.category));
  });

  router.get('/trending', (_req, res) => {
    res.json(db.prepare(`${VIDEO_SELECT} ORDER BY v.views DESC LIMIT 24`).all());
  });

  router.get('/subscriptions', requireAuth, (req, res) => {
    const rows = db
      .prepare(
        `${VIDEO_SELECT}
         WHERE v.user_id IN (SELECT channel_id FROM subscriptions WHERE subscriber_id = ?)
         ORDER BY v.created_at DESC, v.id DESC LIMIT 60`,
      )
      .all(req.user.id);
    res.json(rows);
  });

  router.get('/:id', optionalAuth, (req, res) => {
    const video = getVideo(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const counts = db
      .prepare(
        `SELECT COALESCE(SUM(value = 1), 0) AS likes, COALESCE(SUM(value = -1), 0) AS dislikes
         FROM likes WHERE video_id = ?`,
      )
      .get(video.id);
    const subscriberCount = db
      .prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE channel_id = ?')
      .get(video.channelId).n;

    let userLike = 0;
    let subscribed = false;
    if (req.user) {
      userLike =
        db.prepare('SELECT value FROM likes WHERE user_id = ? AND video_id = ?').get(req.user.id, video.id)
          ?.value || 0;
      subscribed = !!db
        .prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?')
        .get(req.user.id, video.channelId);
    }

    res.json({ ...video, ...counts, subscriberCount, userLike, subscribed });
  });

  router.get('/:id/related', (req, res) => {
    const video = getVideo(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const rows = db
      .prepare(
        `${VIDEO_SELECT} WHERE v.id != ?
         ORDER BY (v.category = ?) DESC, (v.user_id = ?) DESC, v.views DESC LIMIT 20`,
      )
      .all(video.id, video.category, video.channelId);
    res.json(rows);
  });

  router.post(
    '/',
    requireAuth,
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
    (req, res) => {
      const { title, description = '', category = 'General', videoUrl, thumbnailUrl, duration } =
        req.body || {};
      const videoFile = req.files?.video?.[0];
      const thumbFile = req.files?.thumbnail?.[0];
      const cleanup = () => [videoFile, thumbFile].forEach((f) => f && removeUpload(publicPath(f)));

      if (!title?.trim()) {
        cleanup();
        return res.status(400).json({ error: 'Title is required' });
      }
      const finalVideoUrl = publicPath(videoFile) || videoUrl?.trim();
      if (!finalVideoUrl) {
        cleanup();
        return res.status(400).json({ error: 'A video file or video URL is required' });
      }
      if (!videoFile && !/^https?:\/\//i.test(finalVideoUrl)) {
        return res.status(400).json({ error: 'Video URL must start with http(s)://' });
      }

      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, category, duration)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          req.user.id,
          title.trim(),
          description,
          finalVideoUrl,
          publicPath(thumbFile) || thumbnailUrl?.trim() || null,
          category.trim() || 'General',
          Number(duration) || 0,
        );
      res.status(201).json(getVideo(lastInsertRowid));
    },
  );

  router.patch('/:id', requireAuth, upload.single('thumbnail'), (req, res) => {
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.user_id !== req.user.id) return res.status(403).json({ error: 'Not your video' });

    const { title, description, category } = req.body || {};
    let thumbnail = video.thumbnail_url;
    if (req.file) {
      removeUpload(video.thumbnail_url);
      thumbnail = publicPath(req.file);
    }
    db.prepare(
      'UPDATE videos SET title = ?, description = ?, category = ?, thumbnail_url = ? WHERE id = ?',
    ).run(
      title?.trim() || video.title,
      description ?? video.description,
      category?.trim() || video.category,
      thumbnail,
      video.id,
    );
    res.json(getVideo(video.id));
  });

  router.delete('/:id', requireAuth, (req, res) => {
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.user_id !== req.user.id) return res.status(403).json({ error: 'Not your video' });
    db.prepare('DELETE FROM videos WHERE id = ?').run(video.id);
    removeUpload(video.video_url);
    removeUpload(video.thumbnail_url);
    res.status(204).end();
  });

  // Record a view (and add to watch history for signed-in users)
  router.post('/:id/view', optionalAuth, (req, res) => {
    const { changes } = db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(req.params.id);
    if (!changes) return res.status(404).json({ error: 'Video not found' });
    if (req.user) {
      db.prepare(
        `INSERT INTO history (user_id, video_id) VALUES (?, ?)
         ON CONFLICT(user_id, video_id) DO UPDATE SET watched_at = datetime('now')`,
      ).run(req.user.id, req.params.id);
    }
    res.json({ views: db.prepare('SELECT views FROM videos WHERE id = ?').get(req.params.id).views });
  });

  // value: 1 = like, -1 = dislike, 0 = clear
  router.post('/:id/like', requireAuth, (req, res) => {
    const value = Number(req.body?.value);
    if (![1, -1, 0].includes(value)) return res.status(400).json({ error: 'value must be 1, -1 or 0' });
    if (!getVideo(req.params.id)) return res.status(404).json({ error: 'Video not found' });

    if (value === 0) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND video_id = ?').run(req.user.id, req.params.id);
    } else {
      db.prepare(
        `INSERT INTO likes (user_id, video_id, value) VALUES (?, ?, ?)
         ON CONFLICT(user_id, video_id) DO UPDATE SET value = excluded.value`,
      ).run(req.user.id, req.params.id, value);
    }
    const counts = db
      .prepare(
        `SELECT COALESCE(SUM(value = 1), 0) AS likes, COALESCE(SUM(value = -1), 0) AS dislikes
         FROM likes WHERE video_id = ?`,
      )
      .get(req.params.id);
    res.json({ ...counts, userLike: value });
  });

  router.get('/:id/comments', (req, res) => {
    const rows = db
      .prepare(
        `SELECT c.id, c.text, c.created_at AS createdAt,
                u.id AS userId, u.username, u.avatar_url AS avatarUrl
         FROM comments c JOIN users u ON u.id = c.user_id
         WHERE c.video_id = ? ORDER BY c.created_at DESC, c.id DESC`,
      )
      .all(req.params.id);
    res.json(rows);
  });

  router.post('/:id/comments', requireAuth, (req, res) => {
    const text = req.body?.text?.trim();
    if (!text) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (text.length > 2000) return res.status(400).json({ error: 'Comment is too long' });
    if (!getVideo(req.params.id)) return res.status(404).json({ error: 'Video not found' });

    const { lastInsertRowid } = db
      .prepare('INSERT INTO comments (video_id, user_id, text) VALUES (?, ?, ?)')
      .run(req.params.id, req.user.id, text);
    const comment = db
      .prepare(
        `SELECT c.id, c.text, c.created_at AS createdAt,
                u.id AS userId, u.username, u.avatar_url AS avatarUrl
         FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      )
      .get(lastInsertRowid);
    res.status(201).json(comment);
  });

  return router;
}
