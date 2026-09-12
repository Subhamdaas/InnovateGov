# InnovateGov (StartSI)

> A modern digital bridge between Government Problem Statements, Innovative Startups, and Fast-Track Pilot Deployments. Built for Smart India Hackathon (SIH).

---

## 🏛️ System Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Zustand, Lucide Icons.
- **Backend**: NestJS, Node.js, Prisma ORM, Class Validator, Cryptographic Scrypt password derivation & JWT Auth.
- **Database**: Supabase PostgreSQL (Cloud Database).
- **Authentication**:
  - Secure Email/Password registration and login with salt + scrypt hashing.
  - Interactive Google OAuth & Single Sign-On Account Chooser.
  - Role-based protected routing (`GOVERNMENT`, `STARTUP`, `EVALUATOR`).

---

## 📁 Repository Structure

```
SIH_PROJECT/
├── backend/
│   └── startsi-backend/         # NestJS REST API & Prisma Service
│       ├── prisma/              # Prisma schema, migrations & seed scripts
│       ├── src/
│       │   ├── auth/            # Scrypt Auth, JWT, Google OAuth & RBAC
│       │   ├── challenges/      # Government problem statements
│       │   ├── startups/        # Startup profiles & capability telemetry
│       │   ├── applications/    # Pilot applications
│       │   └── evaluations/     # Evaluator scoring & decision workflows
├── startsi/                     # Next.js 16 Web Application (Frontend)
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Dashboard, Portals)
│   │   ├── components/          # UI Components, AppShell & AuthGuard
│   │   ├── store/               # Zustand Session & State Management
│   │   └── lib/                 # API client & animations
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend/startsi-backend

# Install dependencies
npm install

# Configure environment variables (refer to .env.example)
cp .env.example .env

# Generate Prisma Client & Push Database Schema to Supabase
npx prisma generate
npx prisma db push

# (Optional) Seed Initial Hackathon Data
npm run prisma:seed

# Run Auth Test Suite
npm run test:auth

# Start the Backend (Port 4000)
npm run start:dev
```

### 2. Frontend Setup

```bash
cd ../../startsi

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start the Next.js Frontend (Port 3000)
npm run dev
```

Visit **http://localhost:3000** to access the InnovateGov platform.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password |
|---|---|---|
| **Government Officer** | `amit.sharma@gov.in` | `Password123!` |
| **Startup Founder** | `priya.nair@aerobotics.in` | `Password123!` |
| **Evaluator** | `vikram.sen@iitd.ac.in` | `Password123!` |
| **Google Sign-In** | One-click via `SUBHAM DAS` or any account | Google Auth |
