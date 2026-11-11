# YouTube Clone (Full Stack)

A full-stack YouTube clone built with **React + Vite** on the frontend and **Node.js + Express + SQLite** on the backend.

## Features

- **Accounts**: register, sign in, and sign out, using JWT auth with bcrypt-hashed passwords
- **Home feed**: responsive video grid with category filter chips
- **Search**: by title, description or channel, sortable by date or views
- **Watch page**: HTML5 player, view counter, like/dislike, share link, expandable description, related videos
- **Comments**: post comments; the author or the video owner can delete them
- **Channels**: banner, avatar, subscriber count, video list, about tab, profile customization (avatar + description)
- **Subscriptions**: subscribe/unsubscribe, a subscriptions feed, and a sidebar list of your channels
- **Library**: watch history (clearable) and liked videos
- **Upload**: upload a video file with progress bar and optional thumbnail, or add a video by direct URL
- **Studio**: manage your videos (edit title, description, category and thumbnail, or delete)
- **Trending** page sorted by views
- Dark theme similar to YouTube's, with a collapsible sidebar and responsive layout

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, React Router 7, Vite 7, plain CSS |
| Backend  | Express 5, `node:sqlite` (built into Node, no native build step), Multer, JWT, bcryptjs |
| Tests    | `node:test` API integration tests |

## Getting started

Requires **Node.js 22.13+**.

```bash
npm install     # installs root, server and client workspaces
npm run dev     # API on http://localhost:5000, React app on http://localhost:5173
```

Open http://localhost:5173. On first start the database is seeded with sample channels and
Creative Commons sample videos. Sign in with **demo / password123**, or create your own account.

### Production

```bash
npm run build   # builds the React app into client/dist
npm start       # Express serves the API and the built app on http://localhost:5000
```

### Tests

```bash
npm test
```

### Configuration

Set these environment variables (see `server/.env.example`):

| Variable     | Default                  | Description |
|--------------|--------------------------|-------------|
| `PORT`       | `5000`                   | API port |
| `JWT_SECRET` | `dev-secret-change-me`   | **Set this in production** |
| `DB_PATH`    | `./data/youtube.db`      | SQLite file, relative to `server/` |

Uploaded files are stored in `server/uploads/`. To reset all data, delete `server/data/youtube.db*`.

## Project structure

```
├── client/                 React frontend (Vite)
│   └── src/
│       ├── api/client.js   fetch wrapper that adds the JWT
│       ├── AuthContext.jsx auth state
│       ├── components/     Header, Sidebar, VideoCard, Avatar, …
│       └── pages/          Home, Watch, Channel, Upload, Studio, Search, feeds, auth
└── server/                 Express API
    ├── src/
    │   ├── app.js          app factory (routes, static files, error handler)
    │   ├── db.js           SQLite schema
    │   ├── seed.js         sample data
    │   └── routes/         auth, videos, comments, channels, me
    └── test/               API tests
```

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` · `/api/auth/login` | | Get a token |
| GET | `/api/auth/me` | ✔ | Current user |
| GET | `/api/videos?q=&category=&sort=` | | List / search videos |
| GET | `/api/videos/trending` · `/api/videos/categories` | | Trending videos / categories |
| GET | `/api/videos/subscriptions` | ✔ | Subscriptions feed |
| GET | `/api/videos/:id` · `/api/videos/:id/related` | | Video details / related videos |
| POST | `/api/videos` (multipart: `video`, `thumbnail`, or `videoUrl`) | ✔ | Upload |
| PATCH / DELETE | `/api/videos/:id` | owner | Edit / delete |
| POST | `/api/videos/:id/view` | | Count a view (and record history) |
| POST | `/api/videos/:id/like` `{ value: 1 \| -1 \| 0 }` | ✔ | Like / dislike / clear |
| GET / POST | `/api/videos/:id/comments` | POST ✔ | Comments |
| DELETE | `/api/comments/:id` | ✔ | Delete a comment |
| GET | `/api/channels/:id` | | Channel with its videos |
| POST | `/api/channels/:id/subscribe` | ✔ | Toggle subscription |
| GET | `/api/me/history` · `/api/me/liked` · `/api/me/videos` · `/api/me/subscriptions` | ✔ | Library |
| DELETE | `/api/me/history` | ✔ | Clear history |
| PATCH | `/api/me` (multipart: `avatar`, `description`) | ✔ | Update profile |
