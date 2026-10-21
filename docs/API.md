# API

The API is served under `/api`. JSON errors use `{ "error": "message", "details": [] }`.
All data routes other than health and authentication require a verified bearer token.

## Implemented

The root URL and `/api/health` use the same health handler.

| Method | Path      | Access | Response                                  |
| ------ | --------- | ------ | ----------------------------------------- |
| GET    | `/`       | Public | `{ "status": "ok", "app": "<APP_NAME>" }` |
| GET    | `/health` | Public | `{ "status": "ok", "app": "<APP_NAME>" }` |

Authentication requests are rate-limited at 10 attempts per client IP every 15 minutes.
Passwords must be 8–128 characters. Sessions use signed bearer tokens that expire after seven
days. The browser signs out by clearing its session storage; a copied token remains valid until
expiry.

| Method | Path                | Access        | Response                                                        |
| ------ | ------------------- | ------------- | --------------------------------------------------------------- |
| POST   | `/auth/register`    | Public        | `201 { "token": "...", "user": { "id", "fullName", "email" } }` |
| POST   | `/auth/login`       | Public        | `200 { "token": "...", "user": { "id", "fullName", "email" } }` |
| GET    | `/auth/me`          | Authenticated | `200 { "user": { "id", "fullName", "email" } }`                 |
| PATCH  | `/auth/me`          | Authenticated | Update the current user's name and email                        |
| PATCH  | `/auth/me/password` | Authenticated | Verify current password and change it                           |
| DELETE | `/auth/me`          | Authenticated | Verify password and delete the account and owned data           |

Registration normalizes email addresses and reports duplicate email addresses with `409`.
Invalid login credentials receive one generic `401` message. `JWT_SECRET` must be configured
with at least 32 characters before the server starts.

## Planned

| Method | Path                    | Access        |
| ------ | ----------------------- | ------------- |
| POST   | `/auth/forgot-password` | Public        |
| POST   | `/auth/reset-password`  | Public        |
| GET    | `/reports/summary`      | Authenticated |

For authenticated routes, ownership always comes from the verified token, never the request body.

### Authentication response contract

The authentication screens expect the following JSON request bodies:

- `POST /auth/register`: `{ "fullName": "...", "email": "...", "password": "..." }`
- `POST /auth/login`: `{ "email": "...", "password": "..." }`

On success, both endpoints return `{ "token": "...", "user": { "id": "...", "fullName": "...", "email": "..." } }`.
The client keeps the token in session storage for the current browser tab and verifies it through
`GET /auth/me` before rendering workspace routes. Google/GitHub OAuth integrations and password
reset are not implemented yet.

## User data

Every application, CV, and analysis request requires a bearer token. Ownership is derived from
the verified token and every read, update, or delete is scoped by that user ID.

| Method | Path                       | Access        |
| ------ | -------------------------- | ------------- |
| GET    | `/applications`            | Authenticated |
| POST   | `/applications`            | Authenticated |
| PATCH  | `/applications/:id`        | Authenticated |
| DELETE | `/applications/:id`        | Authenticated |
| PATCH  | `/applications/:id/status` | Authenticated |
| POST   | `/resumes/base`            | Authenticated |
| GET    | `/resumes`                 | Authenticated |
| DELETE | `/resumes/:id`             | Authenticated |
| POST   | `/tailoring/analyze`       | Authenticated |
| POST   | `/tailoring/save`          | Authenticated |

- Applications support list, create, edit, status updates with status history, and confirmed
  deletion. Deleting an application removes its analyses and unlinks saved CV copies.
- `POST /resumes/base` accepts one PDF or DOCX file up to 5 MB in memory. It stores extracted
  text only; the uploaded file is not written to disk. DOCX expanded content is limited to 20 MB.
  CVs with fewer than 100 extracted characters are rejected.
- `GET /resumes` returns the current base CV and saved CV copies with their linked application.
  Replacing a base CV keeps the old text as the source for existing copies.
- `POST /tailoring/analyze` requires an owned application and saved base CV. It uses the
  application's saved job description unless a replacement is supplied in the request. The
  deterministic score and keyword breakdown are stored as an analysis.
- `POST /tailoring/save` saves an unchanged snapshot of the base CV linked to that analysis and
  application. Generated rewrites and user-confirmed recommendations are not implemented yet;
  the snapshot is not represented as an AI-tailored rewrite.
- Dashboard totals and follow-ups are computed from the authenticated application and CV list
  endpoints; there is not a separate dashboard endpoint.
