import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './db.js';

// Public-domain / Creative Commons sample videos hosted by Google.
const BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';
const SAMPLE_VIDEOS = [
  ['blender', 'Big Buck Bunny', 'BigBuckBunny', 'Animation', 596, 'A giant rabbit takes on three bullying rodents in this classic open movie from the Blender Foundation.'],
  ['blender', 'Elephants Dream', 'ElephantsDream', 'Animation', 653, 'The first open movie: two strange characters explore a surreal mechanical world.'],
  ['blender', 'Sintel', 'Sintel', 'Animation', 888, 'A lonely young woman searches for her lost baby dragon, Scales.'],
  ['blender', 'Tears of Steel', 'TearsOfSteel', 'Film', 734, 'A group of warriors and scientists gather in Amsterdam to save the world from destructive robots.'],
  ['techtalks', 'For Bigger Blazes', 'ForBiggerBlazes', 'Tech', 15, 'Introducing Chromecast. The easiest way to enjoy online video on your TV.'],
  ['techtalks', 'For Bigger Escapes', 'ForBiggerEscapes', 'Tech', 15, 'Introducing Chromecast. Stream your favorite shows to the big screen.'],
  ['techtalks', 'For Bigger Fun', 'ForBiggerFun', 'Tech', 60, 'Chromecast makes watching together more fun than ever.'],
  ['techtalks', 'For Bigger Joyrides', 'ForBiggerJoyrides', 'Tech', 15, 'Take your entertainment for a spin with Chromecast.'],
  ['techtalks', 'For Bigger Meltdowns', 'ForBiggerMeltdowns', 'Tech', 15, 'Keep calm and cast on.'],
  ['autoworld', 'Subaru Outback On Street And Dirt', 'SubaruOutbackOnStreetAndDirt', 'Cars', 594, 'Smoking tire takes the all-new Subaru Outback to the highest point we can find.'],
  ['autoworld', 'Volkswagen GTI Review', 'VolkswagenGTIReview', 'Cars', 614, 'The Smoking Tire heads out to Adams Motorsports Park to test the new GTI.'],
  ['autoworld', 'We Are Going On Bullrun', 'WeAreGoingOnBullrun', 'Cars', 47, 'The Smoking Tire is going on the 2010 Bullrun Live Rally.'],
  ['autoworld', 'What Car Can You Get For A Grand?', 'WhatCarCanYouGetForAGrand', 'Cars', 609, 'The Smoking Tire meets up with Chris and Jorge from CarsForAGrand.com.'],
];

const CHANNELS = {
  blender: 'Open movie studio making free, Creative Commons films.',
  techtalks: 'Short clips about gadgets and the latest in consumer tech.',
  autoworld: 'Car reviews, road trips and everything with four wheels.',
};

export function seed(db) {
  const hash = bcrypt.hashSync('password123', 10);
  const ids = {};
  for (const [name, description] of Object.entries(CHANNELS)) {
    ids[name] = db
      .prepare('INSERT INTO users (username, email, password_hash, description) VALUES (?, ?, ?, ?)')
      .run(name, `${name}@example.com`, hash, description).lastInsertRowid;
  }
  const demoId = db
    .prepare('INSERT INTO users (username, email, password_hash, description) VALUES (?, ?, ?, ?)')
    .run('demo', 'demo@example.com', hash, 'Demo account').lastInsertRowid;

  const insert = db.prepare(
    `INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, category, duration, views, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
  );
  SAMPLE_VIDEOS.forEach(([channel, title, file, category, duration, description], i) => {
    insert.run(
      ids[channel],
      title,
      description,
      `${BASE}/${file}.mp4`,
      `${BASE}/images/${file}.jpg`,
      category,
      duration,
      Math.floor(Math.random() * 2_000_000) + 1000,
      `-${i * 3 + 1} days`,
    );
  });

  db.prepare('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)').run(demoId, ids.blender);
  db.prepare('INSERT INTO comments (video_id, user_id, text) VALUES (1, ?, ?)').run(
    demoId,
    'Such a classic! Still holds up years later.',
  );
  db.prepare('INSERT INTO likes (user_id, video_id, value) VALUES (?, 1, 1)').run(demoId);
}

export function seedIfEmpty(db) {
  if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0) {
    seed(db);
    console.log('Seeded database with sample channels and videos (login: demo / password123)');
  }
}

// `npm run seed`: seed the database if it is empty.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedIfEmpty(openDatabase());
}
