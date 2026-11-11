import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';
import { seed } from '../src/seed.js';

let server;
let base;

before(async () => {
  const db = openDatabase(':memory:');
  seed(db);
  server = createApp(db).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());

async function api(path, { token, body, method } = {}) {
  const res = await fetch(base + path, {
    method: method || (body ? 'POST' : 'GET'),
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

test('lists and searches videos', async () => {
  const all = await api('/videos');
  assert.equal(all.status, 200);
  assert.ok(all.data.length >= 10);

  const search = await api('/videos?q=bunny');
  assert.equal(search.data.length, 1);
  assert.equal(search.data[0].title, 'Big Buck Bunny');

  const cars = await api('/videos?category=Cars');
  assert.ok(cars.data.every((v) => v.category === 'Cars'));
});

test('register, login and full interaction flow', async () => {
  const reg = await api('/auth/register', {
    body: { username: 'alice', email: 'alice@example.com', password: 'secret1' },
  });
  assert.equal(reg.status, 201);

  const dup = await api('/auth/register', {
    body: { username: 'alice', email: 'x@example.com', password: 'secret1' },
  });
  assert.equal(dup.status, 409);

  const bad = await api('/auth/login', { body: { login: 'alice', password: 'wrong' } });
  assert.equal(bad.status, 401);

  const { data } = await api('/auth/login', { body: { login: 'alice@example.com', password: 'secret1' } });
  const token = data.token;

  // Upload by URL
  const created = await api('/videos', {
    token,
    body: { title: 'My clip', videoUrl: 'https://example.com/a.mp4', category: 'Music' },
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.channelName, 'alice');
  const id = created.data.id;

  assert.equal((await api(`/videos/${id}/view`, { token, body: {} })).data.views, 1);
  assert.equal((await api('/me/history', { token })).data[0].id, id);

  const liked = await api(`/videos/${id}/like`, { token, body: { value: 1 } });
  assert.deepEqual(liked.data, { likes: 1, dislikes: 0, userLike: 1 });
  const disliked = await api(`/videos/${id}/like`, { token, body: { value: -1 } });
  assert.deepEqual(disliked.data, { likes: 0, dislikes: 1, userLike: -1 });

  const comment = await api(`/videos/${id}/comments`, { token, body: { text: 'Nice!' } });
  assert.equal(comment.status, 201);
  assert.equal((await api(`/videos/${id}/comments`)).data.length, 1);

  const sub = await api('/channels/1/subscribe', { token, body: {} });
  assert.equal(sub.data.subscribed, true);
  const feed = await api('/videos/subscriptions', { token });
  assert.ok(feed.data.length > 0 && feed.data.every((v) => v.channelId === 1));
  assert.equal((await api('/channels/1/subscribe', { token, body: {} })).data.subscribed, false);

  // Another user cannot delete alice's video
  const other = await api('/auth/login', { body: { login: 'demo', password: 'password123' } });
  assert.equal((await api(`/videos/${id}`, { token: other.data.token, method: 'DELETE' })).status, 403);
  assert.equal((await api(`/videos/${id}`, { token, method: 'DELETE' })).status, 204);
  assert.equal((await api(`/videos/${id}`)).status, 404);
});

test('protected routes require auth', async () => {
  assert.equal((await api('/me/history')).status, 401);
  assert.equal((await api('/videos', { body: { title: 'x' } })).status, 401);
});
