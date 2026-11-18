# Fundoo Notes (Apollo GraphQL backend)

A Google-Keep-style notes **API** (GraphQL) with an optional **GitHub integration**. This repository contains the backend only; there is no frontend/UI in it.

## What it does
- **Users**: sign up (email verification link), login (JWT), forgot/reset password, update/delete own account.
- **Notes**: create, edit, delete, reminders, archive, trash, pin flag, attach labels; search by title/description.
- **Labels** and **collaborators** (share a note with another user; the collaborator is notified by mail).
- **GitHub** (OAuth login + GitHub API through the logged-in user's token): list/fetch/create/delete repositories, star/unstar, watch, branches, collaborators, commits, webhooks, issues, issue comments, labels, and profile status.
- Redis caches each user's labels; Elasticsearch helper scripts live in `ElasticSearch/` (standalone, not used by the API).

## Tech stack
Node.js, Apollo Server 2, GraphQL, MongoDB (Mongoose 5), Redis (async-redis), JWT (jsonwebtoken), bcrypt, nodemailer (Gmail), Winston logging, axios / apollo-fetch for GitHub, AWS S3 + multer (profile pictures, not wired up), Mocha/Chai/Supertest/nyc for tests.

## Structure
```
server.js                     Apollo server bootstrap (context = ?token= & ?code= query params)
Apollo-Graphql/Types          GraphQL schema (typeDefs)
Apollo-Graphql/Query          Query resolvers
Apollo-Graphql/Mutation       Mutation resolvers (user, note, label, collaborator, git*, upload)
Apollo-Graphql/Resolver       Wires queries/mutations + field resolvers
Authentication/               JWT helpers (sign, verify, requireUser)
model/                        Mongoose schemas
Mongoconfig/                  MongoDB / Redis connection
sendMailer/, services/        Mail, logger, GitHub HTTP helper, S3 upload, error helper
ElasticSearch/                Standalone Elasticsearch scripts
testing/                      Mocha integration tests
```

## Setup
Requirements: Node 14+, MongoDB, Redis.

```bash
npm install
cp .env.example .env      # then fill it in (see comments inside)
npm run dev               # nodemon, or: npm start
```
Minimum to boot: `PORT`, `MONGO_PORT` (a MongoDB URI), `REDIS_PORT`, `SECRET_KEY`. Mail needs `EMAIL`/`PASSWORD` (Gmail app password). GitHub features need a GitHub OAuth app (`CLIENT_ID`, `CLIENT_SECRET`, callback = `GIT_LINK`). All config is via environment variables; never commit `.env`.

GraphQL endpoint/playground: `http://localhost:$PORT/`. Authenticated calls pass the JWT as `?token=<jwt>` in the URL (existing design).
Typical flow: `signUp` -> open the emailed link/token -> `emailVerify` -> `login` -> use the returned token.

## Tests
`npm test` (sets `NODE_ENV=test`, which makes sign-up/forgot-password return their tokens in the response since there is no mailbox). The suite is an integration suite that expects live MongoDB/Redis on `PORT=4000` and a **pre-seeded database** (e.g. a verified user), so it does not pass on an empty database. GitHub tests need real GitHub credentials.

## Known issues / not done
- Apollo Server 2, `elasticsearch`, and AWS SDK v2 are end-of-life; migrating is a larger job.
- Tokens travel in the URL query string (logged by proxies); an `Authorization` header would be better.
- `picUpload` is not functional (the S3 middleware isn't mountable with `server.listen`).
- GitHub features were adapted to header-based auth but not verified against the live GitHub API.
- `starRepository` acts on the single repo id in `GIT_ID`.
