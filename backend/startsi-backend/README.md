# StartSI Backend — 1-day prototype

Backend for the existing StartSI frontend. It replaces the frontend's in-memory mock API with NestJS + Prisma + PostgreSQL.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`
3. `docker compose up -d`
4. `npx prisma generate`
5. `npx prisma migrate deploy`
6. `npm run prisma:seed`
7. `npm run start:dev`

API: `http://localhost:4000/api` (PostgreSQL is exposed locally on port `5433` to avoid conflicts with other projects.)

## Connect the frontend

Copy `C:\SIH-PROJECT\startsi-frontend-api.ts` over the frontend repository's `src/lib/api.ts`, then add this to the frontend `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Restart the Next.js development server after adding the environment variable. The replacement API client uses this backend for login, challenges, applications, evaluations, pilots, payments milestones, and dashboard data.

## Demo login emails
- `amit.sharma@gov.in`
- `founder@techstartup.in`
- `priya.sharma@evaluator.org`

Passwords are intentionally ignored for this prototype.
