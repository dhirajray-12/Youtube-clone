import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { UPLOAD_DIR } from './config.js';

const FOLDERS = { video: 'videos', thumbnail: 'thumbnails', avatar: 'avatars' };

const storage = multer.diskStorage({
  destination(_req, file, cb) {
    const dir = path.join(UPLOAD_DIR, FOLDERS[file.fieldname] || 'misc');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok =
    file.fieldname === 'video'
      ? file.mimetype.startsWith('video/')
      : file.mimetype.startsWith('image/');
  if (!ok) {
    const err = new Error(`Invalid file type for "${file.fieldname}"`);
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

export function publicPath(file) {
  return file ? `/uploads/${FOLDERS[file.fieldname]}/${file.filename}` : null;
}

// Removes a previously uploaded local file (ignores remote URLs).
export function removeUpload(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const file = path.join(UPLOAD_DIR, url.slice('/uploads/'.length));
  if (file.startsWith(UPLOAD_DIR)) fs.rm(file, { force: true }, () => {});
}
