# Application tracker and CV tailoring

A web app for managing job applications and tailoring a CV to each opportunity.

## Requirements

- Node.js 22 or later
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

Install all workspace dependencies from the repository root:

```sh
npm install
```

Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your MongoDB connection
string. The `CLIENT_ORIGIN` value must match the client URL. Copy `client/.env.example` to
`client/.env` only if the server uses a different URL than `http://localhost:5000`; set
`VITE_SERVER_URL` to the server's origin (for example, `https://api.example.com`).

For MongoDB Atlas, confirm the cluster is running and add your current public IP address to
**Network Access** in Atlas. Your network must allow outbound connections to MongoDB. Avoid
allowing access from all IP addresses except as a short-lived diagnostic step.

## Run

```sh
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- Server status: http://localhost:5000
- Health check: http://localhost:5000/api/health

The server connects to MongoDB before it starts listening. The health endpoint does not query
MongoDB. The client calls the server's root URL directly; CORS allows only the configured
`CLIENT_ORIGIN`.

## Project layout

```text
client/       React, Vite, Tailwind CSS, React Router
server/       Express API, Mongoose models, middleware, and tests
docs/         Product requirements, API contract, decisions, and tailoring specification
fixtures/     Test fixtures added with their related feature
```

## Commands

```sh
npm run check    # lint, tests, and production build
npm run lint:fix
npm run format
npm test
npm run build
```

The current API implements `GET /api/health`. The remaining routes are listed as planned in
[docs/API.md](./docs/API.md).
