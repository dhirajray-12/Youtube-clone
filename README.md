<div align="center">

<img src="client/public/logo.svg" alt="Logo" width="72" />

# YouTube Clone

A full-stack video sharing platform built with **React** and **Node.js**.
Upload, watch, like, comment on and subscribe to videos, all from one self-contained app.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.13%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-node%3Asqlite-003B57?logo=sqlite&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [Author](#author)

## Overview

This project recreates the core experience of a modern video platform: a responsive home feed,
a watch page with an HTML5 player, channels, subscriptions, a personal library and a creator
studio. The backend is a REST API on Express 5 that uses Node's built-in SQLite module, so
**there is no external database to install and no native build step**. Clone it, install it and run it.

On first start the database is seeded with sample channels and Creative Commons videos, so the
app has content to browse right away.

## Features

### For viewers
- **Home feed**: responsive video grid with category filter chips
- **Search**: across titles, descriptions and channel names, sortable by date or views
- **Watch page**: HTML5 player, view counter, like/dislike, share link, expandable description and related videos
- **Comments**: post comments on any video
- **Trending**: the most-viewed videos
- **Subscriptions**: subscribe to channels, with a dedicated feed and a sidebar shortcut list
- **Library**: watch history (clearable) and liked videos

### For creators
- **Upload**: video files with a live progress bar and an optional custom thumbnail, or add a video by direct URL
- **Studio**: edit the title, description, category and thumbnail of your videos, or delete them
- **Channel page**: banner, avatar, subscriber count, video list and an About tab
- **Profile customization**: avatar and channel description
- **Moderation**: video owners can delete comments on their own videos

### Platform
- JWT authentication with bcrypt-hashed passwords
- Dark theme, collapsible sidebar and a layout that works on desktop and mobile
- One-command development setup; a single server hosts both the API and the built app in production

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Frontend** | React 19, React Router 7, Vite 7, plain CSS |
| **Backend**  | Node.js 22.13+, Express 5 |
| **Database** | SQLite through the built-in `node:sqlite` module |
| **Auth**     | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Uploads**  | Multer (disk storage) |
| **Testing**  | `node:test` API integration tests |
| **Tooling**  | npm workspaces, `concurrently` |

## Architecture

```
┌──────────────────────┐        /api/*  (JSON + JWT)        ┌──────────────────────────┐
│   React SPA (Vite)   │ ─────────────────────────────────▶ │     Express 5 REST API     │
│  client/  :5173 dev  │ ◀───────────────────────────────── │     server/  :5000         │
└──────────────────────┘        /uploads/*  (media)         └─────────────┬──────────────┘
                                                                            │
                                                     ┌──────────────────────┼──────────────────────┐
                                                     ▼                                             ▼
                                          SQLite (server/data/)                      File storage (server/uploads/)
                                    users · videos · comments · likes ·              videos · thumbnails · avatars
                                        subscriptions · history
```

In development, Vite serves the client and forwards API requests to the Express server.
In production, Express serves the API, the uploaded media and the built client from `client/dist`.

## Getting Started

### Prerequisites

- **Node.js 22.13 or later** (needed for the built-in `node:sqlite` module)
- **npm 10 or later**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dhirajray-12/Youtube-clone.git
cd Youtube-clone

# 2. Install dependencies for the root, server and client workspaces
npm install

# 3. (Optional) create an environment file
cp server/.env.example server/.env

# 4. Start the API and the React app together
npm run dev
```

| Service      | URL                     |
|--------------|-------------------------|
| React app    | http://localhost:5173   |
| API server   | http://localhost:5000   |
| Health check | http://localhost:5000/api/health |

### Demo account

| Username | Password      |
|----------|---------------|
| `demo`   | `password123` |

You can also register a new account from the sign-in page.

### Production build

```bash
npm run build   # builds the React app into client/dist
npm start       # serves the API and the built app on http://localhost:5000
```

## Available Scripts

Run these from the repository root:

| Command         | Description |
|-----------------|-------------|
| `npm run dev`   | Starts the API (with file watching) and the Vite dev server together |
| `npm run build` | Creates a production build of the client |
| `npm start`     | Starts the production server |
| `npm run seed`  | Seeds the database with sample channels and videos |
| `npm test`      | Runs the API integration test suite |

## Configuration

The server reads these environment variables (see [`server/.env.example`](server/.env.example)):

| Variable     | Default                 | Description |
|--------------|-------------------------|-------------|
| `PORT`       | `5000`                  | Port the API server listens on |
| `JWT_SECRET` | `dev-secret-change-me`  | Secret used to sign auth tokens. **Always set this in production.** |
| `DB_PATH`    | `./data/youtube.db`     | Location of the SQLite file, relative to `server/` |

**Data and storage**
- Uploaded media is stored in `server/uploads/` (`videos/`, `thumbnails/`, `avatars/`).
- The maximum upload size is **500 MB** per file. Videos must have a `video/*` MIME type; thumbnails and avatars must have an `image/*` type.
- To reset all data, stop the server and delete `server/data/youtube.db*`. The database is re-seeded on the next start.

## Project Structure

```
Youtube-clone/
├── client/                       # React frontend (Vite)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/client.js         # Fetch wrapper that attaches the JWT
│   │   ├── AuthContext.jsx       # Global authentication state
│   │   ├── components/           # Header, Sidebar, VideoCard, Avatar, Icons, RequireAuth
│   │   ├── pages/                # Home, Watch, Channel, Upload, Studio, Search, Trending, Feeds, Auth
│   │   ├── useFetch.js           # Data-fetching hook
│   │   ├── utils.js              # Formatting helpers
│   │   └── styles.css            # Application styles
│   └── vite.config.js
├── server/                       # Express REST API
│   ├── src/
│   │   ├── app.js                # App factory: routes, static files, error handling
│   │   ├── index.js              # Server entry point
│   │   ├── config.js             # Environment configuration
│   │   ├── db.js                 # SQLite schema and connection
│   │   ├── auth.js               # JWT helpers and auth middleware
│   │   ├── upload.js             # Multer upload handling
│   │   ├── seed.js               # Sample data
│   │   └── routes/               # auth, videos, comments, channels, me
│   ├── test/                     # API integration tests
│   ├── data/                     # SQLite database (git-ignored)
│   └── uploads/                  # Uploaded media (git-ignored)
└── package.json                  # npm workspaces and root scripts
```

## API Reference

Base URL: `/api`. Endpoints marked ✔ require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint          | Auth | Description |
|--------|-------------------|:----:|-------------|
| POST   | `/auth/register`  |      | Create an account and receive a token |
| POST   | `/auth/login`     |      | Sign in with a username or email |
| GET    | `/auth/me`        | ✔    | Get the current user |

### Videos

| Method | Endpoint                           | Auth  | Description |
|--------|------------------------------------|:-----:|-------------|
| GET    | `/videos?q=&category=&sort=`       |       | List and search videos |
| GET    | `/videos/trending`                 |       | Trending videos |
| GET    | `/videos/categories`               |       | All categories |
| GET    | `/videos/subscriptions`            | ✔     | Feed from subscribed channels |
| GET    | `/videos/:id`                      |       | Video details |
| GET    | `/videos/:id/related`              |       | Related videos |
| POST   | `/videos`                          | ✔     | Upload a video (multipart: `video`, `thumbnail`, or `videoUrl`) |
| PATCH  | `/videos/:id`                      | owner | Edit a video |
| DELETE | `/videos/:id`                      | owner | Delete a video |
| POST   | `/videos/:id/view`                 |       | Count a view and record watch history |
| POST   | `/videos/:id/like`                 | ✔     | Like, dislike or clear (`{ "value": 1 \| -1 \| 0 }`) |

### Comments

| Method | Endpoint                | Auth | Description |
|--------|-------------------------|:----:|-------------|
| GET    | `/videos/:id/comments`  |      | List comments on a video |
| POST   | `/videos/:id/comments`  | ✔    | Add a comment |
| DELETE | `/comments/:id`         | ✔    | Delete a comment (its author or the video owner) |

### Channels and library

| Method | Endpoint                   | Auth | Description |
|--------|----------------------------|:----:|-------------|
| GET    | `/channels/:id`            |      | Channel profile and its videos |
| POST   | `/channels/:id/subscribe`  | ✔    | Toggle a subscription |
| GET    | `/me/history`              | ✔    | Watch history |
| DELETE | `/me/history`              | ✔    | Clear watch history |
| GET    | `/me/liked`                | ✔    | Liked videos |
| GET    | `/me/videos`               | ✔    | Your uploaded videos |
| GET    | `/me/subscriptions`        | ✔    | Channels you subscribe to |
| PATCH  | `/me`                      | ✔    | Update your profile (multipart: `avatar`, `description`) |

## Testing

The server includes integration tests that start the app against a seeded in-memory database and cover
video listing and search, the full sign-up → upload → like → comment flow, and enforcement of
authentication on protected routes.

```bash
npm test
```

## Security Notes

- Passwords are hashed with bcrypt and never returned by the API.
- Tokens are signed JWTs that expire after **7 days**.
- Usernames must be 3 to 30 letters, digits or underscores, and passwords must be at least 6 characters.
- Uploads are filtered by MIME type and saved under random file names.
- Before deploying, set a strong `JWT_SECRET` and serve the app over HTTPS.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Make sure `npm test` passes.
5. Push the branch and open a pull request.

## Author

**Dhiraj**: [@dhirajray-12](https://github.com/dhirajray-12)

If you find this project useful, consider giving it a ⭐ on GitHub.

---

<sub>This is an educational project and is not affiliated with or endorsed by YouTube or Google.</sub>
