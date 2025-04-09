<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

---

## 📦 Project Setup (Local Dev)

```bash
# 1. Clone the repo
git clone <repo-url>

# 2. Install dependencies
npm install

# 3. Copy .env
cp .env.example .env

# 4. Fill in .env values as needed
```

Start the app:

```bash
# Dev mode (auto-restart on changes)
npm run start:dev
```

---

## ⚙️ Environment Variables

Create a `.env` file and define the following keys:

```env
# Application
NODE_ENV=
PORT=

# PostgreSQL
DATABASE_URL=

# Redis
REDIS_URL=

# JWT Auth
JWT_SECRET=
JWT_EXPIRATION=

# Swagger Docs
SWAGGER_TITLE=
SWAGGER_DESCRIPTION=
SWAGGER_VERSION=

# Security
HASH_COST=
```

---

## 🐳 Docker Setup (with PostgreSQL & Redis)

Spin everything up using Docker:

```bash
docker-compose up --build
```

By default:
- App runs at http://localhost:3000
- PostgreSQL runs on port 5432
- Redis runs on port 6379

Make sure `.env` values match Docker services if using them.

---

## ▶️ Run the App

```bash
# Start dev server
npm run start:dev

# Start in prod (after build)
npm run build
npm run start:prod
```

---

## ✅ Testing

```bash
# Run unit tests
npm run test

# Test coverage
npm run test:cov
```

---

## 🚀 Deployment

**Recommended steps:**

1. Build the app:
   ```bash
   npm run build
   ```

2. Run using Node or process manager like PM2:
   ```bash
   node dist/main
   # or
   pm2 start dist/main.js --name app-name
   ```

3. Make sure `.env` is configured correctly in the deployment environment.

4. Use Docker or system services to keep the app running reliably.

Optional (Docker):
```bash
# Production build and run
docker-compose up --build -d
```

---

## 🧠 Tech Stack

- NestJS (Node.js Framework)
- PostgreSQL (Relational DB)
- Redis (Caching/Session)
- Docker (Dev & Deployment)
- JWT (Authentication)

---