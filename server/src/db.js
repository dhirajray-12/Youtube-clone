import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from './config.js';

export function openDatabase(file = DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      avatar_url    TEXT,
      banner_color  TEXT DEFAULT '#3ea6ff',
      description   TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title         TEXT NOT NULL,
      description   TEXT DEFAULT '',
      video_url     TEXT NOT NULL,
      thumbnail_url TEXT,
      category      TEXT DEFAULT 'General',
      duration      REAL DEFAULT 0,
      views         INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id   INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      value    INTEGER NOT NULL CHECK (value IN (-1, 1)),
      PRIMARY KEY (user_id, video_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      subscriber_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      channel_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (subscriber_id, channel_id)
    );

    CREATE TABLE IF NOT EXISTS history (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      video_id   INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      watched_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, video_id)
    );

    CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
  `);
  return db;
}

// SQL fragment that selects a video row joined with its channel.
export const VIDEO_SELECT = `
  SELECT v.id, v.title, v.description, v.video_url AS videoUrl, v.thumbnail_url AS thumbnailUrl,
         v.category, v.duration, v.views, v.created_at AS createdAt,
         u.id AS channelId, u.username AS channelName, u.avatar_url AS channelAvatar
  FROM videos v JOIN users u ON u.id = v.user_id
`;
