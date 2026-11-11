import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(__dirname, '..');
export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const DB_PATH = process.env.DB_PATH
  ? path.resolve(ROOT_DIR, process.env.DB_PATH)
  : path.join(ROOT_DIR, 'data', 'youtube.db');
export const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');
export const CLIENT_DIST = path.resolve(ROOT_DIR, '..', 'client', 'dist');
