# ROADMAP

Status: `[ ]` not started, `[~]` in progress, `[x]` done. These marks track implementation
work; they do not imply deployment or user evaluation.
IDs match the PRD. Work in the order below. Finish each step before the next.

## Step 1. Scaffold and models

- [x] Monorepo with `client/` and `server/`
- [x] Four Mongoose models
- [x] Health route, error handler, security headers
- [x] Lint, format, tests, CI

## Step 2. Authentication

- [x] Client: registration and login screens, protected workspace routes, session token storage
- [x] ACC-1 Register (`POST /api/auth/register`) with bcrypt password hashes
- [x] ACC-2 Login, session verification, and client logout (`POST /api/auth/login`, `GET /api/auth/me`)
- [x] Existing scrypt hashes upgrade to bcrypt after successful login
- [x] Auth middleware that sets `req.userId`
- [x] Rate limit on login
- Exit: a user can register, log in, and reach a protected page. Tests cover bad passwords and duplicate emails.

## Step 3. Applications

- [x] APP-1 Create an application
- [x] APP-2 Edit and delete
- [x] APP-3 Change status (Kanban drag and a menu for touch)
- [x] APP-6 Show status history, including old/new status and change date
- [x] Status history is written on each change
- [x] Client: application board and list use authenticated persisted records
- Exit: a user can add 10 applications and move them across the board. Another user cannot see them.

## Step 4. CV upload

- [x] CV-1 Upload PDF or DOCX, extract text, show preview
- [x] CV-2 Detect unreadable files
- [x] CV-3 Replace the base CV while preserving prior source CV records
- [~] CV-4 Saved-copy listing shows application and source CV; genuine tailored CVs await TAI-6
- [x] Client: CV manager uses authenticated file processing and persisted text
- Exit: PDF and DOCX upload tests verify extracted text. An image-only PDF shows a clear message.

## Step 5. Tailoring

- [x] TAI-1 to TAI-3 Keywords, normalization, score (server-side deterministic scoring)
- [x] Client: analysis uses the saved base CV and application description
- [x] Client: recommendations with reasons and job-description source lines
- [ ] TAI-6 Generate and save a genuinely tailored CV linked to the application (currently saves an unchanged analysis snapshot)
- [ ] TAI-7 User-confirmed recommendations before rewriting
- [x] TAI-8 Deterministic analysis works without an AI service
- [ ] TAI-9 Remove personal data before AI calls
- Exit: deterministic keyword extraction and scoring are covered by tests. No AI service is
  integrated; the core analysis runs locally on the server without an AI dependency.

## Step 6. Dashboard and reminders

- [x] Client: dashboard totals and status counts from authenticated records
- [x] Client: follow-ups due in 7 days and overdue follow-ups
- [x] DSH-1 and DSH-2: live application counts and follow-ups
- [~] DSH-3: latest applications are live; the CV list currently contains unchanged analysis snapshots

## Step 7. P1 items and quality

- [x] ACC-3 Edit profile and change password
- [ ] ACC-4 Password reset
- [x] ACC-5 Delete account and all owned data
- [ ] APP-4, APP-5
- [ ] CV-5, CV-6
- [ ] TAI-10, TAI-11
- [ ] DSH-4
- [ ] Fix WCAG contrast failures (Match, Gap, Score on Paper)
- [x] Landing page from Figma
- [x] Client: Settings, profile update, password change, and account deletion
- [ ] Verify dark mode values against the Figma reference
- [ ] Deploy

## Step 8. Testing and evaluation

- [x] MongoDB-backed system test is implemented for registration, application tracking, DOCX upload, analysis, and saving an unchanged snapshot. Run `npm run test:system -w server` with a disposable `TEST_MONGODB_URI`; generated rewriting is not covered because TAI-6 and TAI-7 are not implemented.
- [ ] User acceptance test and SUS questionnaire
- [ ] Record results for the report

## Later (P2)

- [ ] ACC-6 GitHub sign-in
- [ ] DSH-5 Email reminders
