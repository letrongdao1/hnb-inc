# HNB Inc

Internal community platform for HNB — social feed, chat, events, an internal file drive, and a few community mini-features (birthday tracking, a guessing game, leaderboards), built with Next.js.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack) + React 19 + TypeScript
- **UI**: Tailwind CSS v4, HeroUI, Framer Motion / Motion
- **Auth & DB**: Supabase (`@supabase/ssr`), enforced via `src/middleware.ts`
- **Storage**: Backblaze B2 (primary) and AWS S3 (via presigned URLs), with client-side image compression, blurhash previews, and Sharp/Jimp processing
- **Cache/session**: Redis (`ioredis`)
- **Email**: Resend + React Email components
- **Forms**: React Hook Form + Yup
- **State**: Zustand

## Getting Started

```bash
npm install
npm run dev       # start dev server (Turbopack) at http://localhost:3000
npm run build     # production build
npm run start     # run production build
npm run lint      # eslint
```

Copy `.env.development` (or ask a teammate for values) and fill in the required variables — see [Environment Variables](#environment-variables) below.

## Project Structure

```
src/
  app/           # Next.js App Router routes (pages + api/)
  components/    # UI components, grouped by feature
  constants/     # Shared constants (e.g. auth-exempt paths)
  hooks/         # Custom React hooks
  interfaces/    # Shared TypeScript types
  lib/           # Integrations: supabase, b2, s3, redis, notifications
  providers/     # React context providers
  stores/        # Zustand stores
  styles/        # Global styles
  utils/         # Helper functions
  middleware.ts  # Supabase-backed auth gate for all non-API routes
```

## Feature Areas

| Area | Routes | Notes |
|---|---|---|
| **Auth** | `/auth/login`, `/auth/signup`, `api/auth/otp/*` | Supabase auth + OTP email verification |
| **Home / Feed** | `/`, `api/home`, `api/posts*` | Posts, comments, reactions, tagging |
| **Chat** | `api/chat/messages*` | Messages with file attachments |
| **Events** | `/events`, `/events/[slug]`, `api/events*` | Event costs, participation, tags, finalize/end flow |
| **News** | `/news`, `/news/[slug]` | |
| **Memes** | `api/memes` | |
| **DHBC** | `/dhbc`, `api/dhbc/*` | Guessing game with a leaderboard and submission history |
| **HNB Drive** (`hnb-evird`) | `/hnb-evird`, `/hnb-evird/folder/[...path]` | Internal file/folder browser over B2 storage |
| **Streaks** | `api/streaks*` | Activity streaks + leaderboard |
| **Profile** | `/profile`, `/account`, `api/profile/*` | Includes linked bank accounts (VietQR) and avatars |
| **Admin / Management** | `/admin/delete`, `/management/hub/*` | Manage events, news, top banners |
| **Lists** | `/list/members`, `/list/venues` | |
| **Top Banners** | `api/top-banners*` | Home page banner rotation |
| **Uploads** | `api/upload*`, `api/b2/*` | Presigned upload, multipart upload, blurhash update |

## Environment Variables

Set these in `.env.development` / `.env.production` (never commit real values):

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Site**: `NEXT_SITE_URL`, `NEXT_REDIRECT_URLS`
- **Email/OTP**: `HNB_NAME`, `HNB_EMAIL_ADDRESS`, `RESEND_API_KEY`, `OTP_HASH_SECRET`
- **VietQR**: `VIETQR_CLIENT_ID`, `VIETQR_API_KEY`
- **Redis**: `REDIS_URL` (dev only)
- **Backblaze B2**: `B2_REGION`, `B2_ENDPOINT`, `B2_BUCKET_ID`, `B2_BUCKET_NAME`, `B2_ACCESS_KEY_ID`, `B2_SECRET_KEY` (dev only)

## Auth Model

`src/middleware.ts` requires a logged-in Supabase user on every route except those listed in `AUTH_NOT_REQUIRED_PATHS` (`src/constants/constants.ts`). Unauthenticated requests are redirected to `/auth/login` with a `redirectedFrom` query param. API routes (`/api/*`) are excluded from this middleware and must handle their own auth checks.
