import { Router } from 'express';
import { requireAuth } from '../auth.js';

export default function commentRoutes(db) {
  const router = Router();

  // Comment author or the video owner may delete a comment.
  router.delete('/:id', requireAuth, (req, res) => {
    const comment = db
      .prepare(
        `SELECT c.user_id, v.user_id AS owner_id FROM comments c
         JOIN videos v ON v.id = c.video_id WHERE c.id = ?`,
      )
      .get(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.id && comment.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.status(204).end();
  });

  return router;
}
