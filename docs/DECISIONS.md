# Decisions

## Initial scaffold

- The project uses the proposed React, Vite, Tailwind, Express, and Mongoose stack in a single
  npm workspace.
- The initial health endpoint is independent of MongoDB so it can report application liveness.
  The server startup itself requires a configured MongoDB URI.
- The external AI provider and file parsing libraries remain undecided until the tailoring and
  resume steps.

## Collection schema alignment

- Keep Mongoose's built-in `_id` for each collection. `users` stores `createdAt` as specified;
  `resumes` also uses Mongoose timestamps (`createdAt`, `updatedAt`) for CV replacement and history.
  `applications` and `recommendations` do not add timestamps beyond their proposal fields.
- `applications.statusHistory` supports the required application status history.
- Recommendation keyword source lines and line numbers support the explainable missing-keyword
  reasons. Recommendation suggestion text and acceptance state support the requirement that users
  review and confirm changes before a tailored CV is produced.
- Schema indexes support unique email, one base CV per user, user-scoped reads, and resume ordering;
  indexes do not add collection fields.
