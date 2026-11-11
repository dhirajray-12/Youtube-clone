import { createApp } from './app.js';
import { openDatabase } from './db.js';
import { PORT } from './config.js';
import { seedIfEmpty } from './seed.js';

const db = openDatabase();
seedIfEmpty(db);

createApp(db).listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
