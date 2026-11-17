# Decisions

## Initial scaffold

- The project uses the proposed React, Vite, Tailwind, Express, and Mongoose stack in a single
  npm workspace.
- The initial health endpoint is independent of MongoDB so it can report application liveness.
  The server startup itself requires a configured MongoDB URI.
- PDF and DOCX extraction are implemented with `pdf-parse`, `fflate`, and `@xmldom/xmldom`.
- No AI provider is integrated. Tailoring currently uses a fixed server-side keyword catalog and
  saves an unchanged CV snapshot; provider selection and actual rewriting remain future work.

## Collection schema alignment

- Keep Mongoose's built-in `_id` for each collection. `users` stores `createdAt` as specified;
  `resumes` also uses Mongoose timestamps (`createdAt`, `updatedAt`) for CV replacement and history.
  `applications` and `recommendations` do not add timestamps beyond their proposal fields.
- `applications.statusHistory` supports the required application status history.
- Recommendation keyword source lines and line numbers support the explainable missing-keyword
  reasons. The schema also has fields for suggested text and acceptance state, but the current API
  does not generate rewrites or accept/reject suggestions.
- Schema indexes support unique email, one base CV per user, user-scoped reads, and resume ordering;
  indexes do not add collection fields.

## Password hashing

- Use the `bcrypt` package to hash the password directly, as specified by the proposal. New
  passwords must fit bcrypt's 72-byte input limit to avoid accepting distinct passwords that bcrypt
  would truncate to the same hash.
- Existing scrypt hashes and hashes from the earlier SHA-256-prehashed bcrypt implementation remain
  verifiable. Compatible passwords are upgraded to direct bcrypt hashes after successful login;
  passwords exceeding 72 UTF-8 bytes retain their existing hash until the user changes the password.
- The save endpoint stores an unchanged analysis snapshot, not a rewritten CV. An AI provider,
  personal-data redaction before any external call, and per-suggestion confirmation remain
  unimplemented.
