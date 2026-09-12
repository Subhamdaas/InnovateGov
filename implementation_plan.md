# Secure Authentication System Overhaul & Bug Fix Plan

This plan completely eliminates the authentication vulnerabilities in the StartSI platform, ensures strict database-verified credentials, fixes registration and login flows, enforces route protection, and provides reliable session state management.

## User Review Required

> [!IMPORTANT]
> **Key Behavioral Clarification on Signup:**
> In accordance with your requirement ("*Prefer redirecting to login after signup unless the current product specification clearly requires auto-login*"), upon successful registration the user will be presented with a prominent success notification (*"Account created successfully! Please sign in with your credentials."*) and automatically transitioned to the **Sign In** tab with their email pre-filled for immediate login.

---

## Root Cause Analysis of the Authentication Bug

Investigation of the authentication flow revealed **four critical security defects** that allowed any email and any password to succeed:

1. **Auto-Registration on Failed Login (`auth.service.ts` line 149):**
   ```ts
   // IN EXISTING CODE:
   if (!user) {
     return this.signup({ email: normalizedEmail, ... }); // AUTO-CREATED ACCOUNT AND LOGGED IN ANYONE
   }
   ```
   When an unknown email was submitted, the login handler silently called `signup()`, inserted a new user into the database, and generated an authentication token.
2. **Missing/Bypassed Password Verification (`auth.service.ts` line 165):**
   ```ts
   // IN EXISTING CODE:
   if (user.password && dto.password && dto.password !== 'password123' && dto.password !== 'google-oauth') { ... }
   ```
   If `user.password` was `null`, or if the password matched `'password123'`, password verification was skipped entirely!
3. **Insecure Null-Hash Fallback (`auth.service.ts` line 43):**
   ```ts
   // IN EXISTING CODE:
   private verifyPassword(password: string, storedHash?: string | null): boolean {
     if (!storedHash) return true; // ANY PASSWORD WAS CONSIDERED VALID IF USER HAD NO HASH
   ```
4. **Seed Users Missing Passwords (`prisma/seed.ts`):**
   The initial demo users in `prisma/seed.ts` were inserted with `password: null`. Combined with flaw #3, any password entered for those accounts was evaluated as `true`.
5. **Lack of Global Route Protection (`AppShell.tsx`):**
   The layout rendered protected navigation and content without verifying whether the session was authenticated and valid against the backend.

---

## Proposed Changes

### Backend (`backend/startsi-backend`)

#### [MODIFY] [auth.service.ts](file:///c:/SIH_PROJECT/backend/startsi-backend/src/auth/auth.service.ts)
- **Strict Login Verification**:
  - Find user by email. If not found, throw `UnauthorizedException("Invalid email or password.")`. **Never** auto-register or create a user in `login()`.
  - Check if `user.password` is present. If absent, throw `UnauthorizedException("Invalid email or password.")`.
  - Verify password hash using timing-safe scrypt comparison. If comparison returns `false`, throw `UnauthorizedException("Invalid email or password.")`.
  - Completely remove `'password123'` and `'google-oauth'` bypass strings.
  - Only issue JWT and authenticated user payload when **both** email exists and password matches.
- **Strict Signup Verification**:
  - Validate required fields: `name`, `email`, `password` (minimum 8 characters), and `role`.
  - Check if email already exists in Supabase. If so, throw `ConflictException("An account with this email already exists. Please sign in.")`.
  - Hash password securely using `crypto.scryptSync` with a 16-byte random salt. Never store plain text.
  - Create persistent `User` (and `Startup` if role is `STARTUP`) in Supabase PostgreSQL.
  - Return `{ success: true, message: "Account created successfully.", user: safeUser }` without manufacturing a session if auto-login is disabled.
- **Token Verification Endpoint (`me`)**:
  - Validates bearer token signature and expiration.
  - Fetches the current user from database. If user no longer exists or token expired, throws 401.

#### [MODIFY] [auth.controller.ts](file:///c:/SIH_PROJECT/backend/startsi-backend/src/auth/auth.controller.ts)
- Add class-validator constraints:
  - `LoginDto`: `@IsEmail() email`, `@IsNotEmpty() @IsString() password`.
  - `SignupDto`: `@IsEmail() email`, `@IsNotEmpty() @MinLength(8) password`, `@IsNotEmpty() name`, `@IsIn(['GOVERNMENT', 'STARTUP', 'EVALUATOR']) role`.

#### [MODIFY] [seed.ts](file:///c:/SIH_PROJECT/backend/startsi-backend/prisma/seed.ts)
- Ensure all default seed users (`amit.sharma@gov.in`, `founder@techstartup.in`, `priya.sharma@evaluator.org`) have properly salted and hashed passwords (`Password123!`) so tests with seed users use legitimate password hash verification.

---

### Frontend (`startsi`)

#### [MODIFY] [api.ts](file:///c:/SIH_PROJECT/startsi/src/lib/api.ts)
- Update `login` and `signup` functions to accurately propagate HTTP error codes (401, 409, 400).
- Update `getMe()` to check active token against `/api/auth/me`.
- Ensure request headers send `Authorization: Bearer <token>` cleanly.

#### [MODIFY] [session.ts](file:///c:/SIH_PROJECT/startsi/src/store/session.ts)
- Introduce explicit authentication statuses: `isAuthenticated: boolean`, `isValidating: boolean`.
- Do **NOT** set `currentUser` or `token` on failed requests.
- Provide `validateSession()` action: calls `getMe()` on application load. If token is invalid or rejected by backend, reset session and mark `isAuthenticated = false`.
- Update `logout()`: wipes `localStorage`, clears session state, and redirects to `/login`.

#### [MODIFY] [page.tsx (Login Page)](file:///c:/SIH_PROJECT/startsi/src/app/login/page.tsx)
- Enforce client-side validation:
  - Email format validation.
  - Password minimum length (8 chars).
  - Password confirmation for sign-up if desired, or validation message.
- Remove all fake/demo auto-logins.
- On Sign Up submit:
  - Calls `apiSignup`.
  - On success: shows clear confirmation message (*"Account created successfully! Please sign in with your credentials."*), switches to Sign In tab, and pre-fills the registered email.
  - On 409 conflict: displays *"An account with this email already exists."*
- On Sign In submit:
  - Calls `apiLogin`.
  - On 401 failure: displays *"Invalid email or password."*
  - On success: saves token/user to session and redirects to appropriate dashboard.

#### [MODIFY] [AppShell.tsx](file:///c:/SIH_PROJECT/startsi/src/components/layout/AppShell.tsx) & [page.tsx (Home)](file:///c:/SIH_PROJECT/startsi/src/app/page.tsx)
- Integrate global route protection in `AppShell`:
  - If page is not public (`/login`, `/for-startups`) and user is not authenticated:
    - Display loading state while hydrating/validating.
    - If unauthenticated, redirect to `/login?redirect=...`.
- If user is authenticated and visits `/login`, redirect to their respective dashboard (`/startup/dashboard` or `/dashboard`).

---

## Verification Plan

### Automated & CLI Verification
1. **TypeScript & Build Verification**:
   - `npx tsc --noEmit` in `c:\SIH_PROJECT\startsi`
   - `npm run build` in `c:\SIH_PROJECT\backend\startsi-backend`
2. **Direct Authentication Flow Tests**:
   - Run a test script against `http://localhost:4000/api/auth`:
     - **Test 1: Unknown Email**: `POST /auth/login` with `nonexistent@test.com` & `AnyPass123!` $\rightarrow$ verify HTTP 401 (`Invalid email or password`).
     - **Test 2: Signup**: `POST /auth/signup` with `newuser@test.com` & `Pass12345!` $\rightarrow$ verify HTTP 201 (`User created in Supabase`).
     - **Test 3: Duplicate Signup**: `POST /auth/signup` with `newuser@test.com` $\rightarrow$ verify HTTP 409 (`Account already exists`).
     - **Test 4: Correct Login**: `POST /auth/login` with `newuser@test.com` & `Pass12345!` $\rightarrow$ verify HTTP 200 + valid JWT.
     - **Test 5: Wrong Password**: `POST /auth/login` with `newuser@test.com` & `WrongPassword!` $\rightarrow$ verify HTTP 401.
     - **Test 6: Token Validation**: `GET /auth/me` with valid JWT $\rightarrow$ HTTP 200; with invalid JWT $\rightarrow$ HTTP 401.
     - **Test 7: Seed User Correct & Wrong**: Verify `amit.sharma@gov.in` with `Password123!` succeeds and with `Wrong123!` fails.

### Manual Route Protection Testing
- Open incognito browser to `http://localhost:3000/dashboard` without logging in $\rightarrow$ verify redirection to `/login`.
- Login with valid credentials $\rightarrow$ verify landing on dashboard and refresh persistence.
- Click Logout $\rightarrow$ verify redirection to `/login` and dashboard is inaccessible.
