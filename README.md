# Personal Finance Tracker

A full-stack personal finance application for recording income and expenses, reviewing financial totals, setting monthly category budgets, and visualizing spending. The client is built with React and Vite; the API uses Node.js, Express, and MongoDB through Mongoose.

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Run the application](#run-the-application)
- [How to use](#how-to-use)
- [API overview](#api-overview)
- [Data and security](#data-and-security)
- [Production deployment notes](#production-deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Scripts and testing](#scripts-and-testing)

## Features

- **Account registration and login:** Passwords are hashed by the server, and successful login returns a JSON Web Token (JWT).
- **Private finance data:** Transaction and budget API routes require a valid bearer token and scope records to the signed-in user.
- **Transactions:** Add income and expense entries with a title, amount, category, and date. The API supports listing, filtering, updating, and deleting transactions.
- **Summary cards:** View total income, total expenses, and net balance.
- **Interactive charts:** A Recharts donut chart breaks expenses down by category; a bar chart compares income and expenses.
- **Monthly budgets:** Create a category spending limit, view spending progress, edit a budget limit, or remove a budget.
- **Responsive interface:** The client uses Tailwind CSS utility classes to adapt the layout to screen size.

## Technology stack

### Client

- React 19
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS and PostCSS
- ESLint

### Server

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `cors` and `dotenv`

## Project structure

```text
personal-finance-tracker/
├── client/
│   ├── src/
│   │   ├── api/             # Axios and API service functions
│   │   ├── component/       # Dashboard, chart, transaction, and budget UI
│   │   ├── context/         # Authentication state
│   │   ├── hooks/           # Shared React hooks
│   │   └── pages/           # Login, registration, and dashboard pages
│   └── package.json
├── server/
│   ├── controllers/         # Request handling and data operations
│   ├── middleware/          # Authentication, validation, and errors
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route declarations
│   ├── .env.example         # Safe environment-variable template
│   └── package.json
└── README.md
```

## Requirements

Install these before starting:

- Node.js (with npm)
- A MongoDB database, local or hosted (for example, MongoDB Atlas)
- Git (optional, for version control)

## Local setup

### 1. Get the project

Clone the Git repository or open the project folder you already have. Open a terminal at the project root (the folder containing `client` and `server`).

### 2. Install client packages

```bash
cd client
npm install
```

### 3. Install server packages

Open a second terminal at the project root, then run:

```bash
cd server
npm install
```

### 4. Configure the server environment

Create a private `server/.env` file using `server/.env.example` as a template. Fill in the MongoDB connection string and a private JWT secret. Do not commit `.env` or paste real secret values into public issues or documentation.

For local development, the example values use the Vite client address `http://localhost:5173` and API port `5000`.

## Environment variables

| Variable     | Required          | Purpose                                                                                                              | Local example                               |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `PORT`       | No                | Port used by the API server. Defaults to `5000`.                                                                     | `5000`                                      |
| `NODE_ENV`   | No                | Set to `production` for production safety checks.                                                                    | `development`                               |
| `CLIENT_URL` | Yes in production | Allowed frontend origin(s) for CORS. Separate multiple origins with commas.                                          | `http://localhost:5173`                     |
| `MONGO_URI`  | Yes               | MongoDB connection string. Treat it as a password.                                                                   | `mongodb://127.0.0.1:27017/finance-tracker` |
| `JWT_SECRET` | Yes               | Secret used to sign and verify login tokens. Use a random private value; production requires at least 32 characters. | Do not use a public example value           |

`server/.env.example` contains placeholders and is safe to commit. `server/.gitignore` excludes `.env` files.

## Run the application

Start the API in one terminal:

```bash
cd server
node index.js
```

Start the Vite client in a second terminal:

```bash
cd client
npm run dev
```

Open the local address printed by Vite (normally `http://localhost:5173`). The server listens on port `5000` by default. The client API module currently points to `http://localhost:5000/api`, so both services need to be running locally for data operations to work.

## How to use

1. Open the client and register an account.
2. Sign in with that account.
3. Add income or expense transactions. Choose the type, category, amount, and date.
4. Review the summary cards and charts. The category donut chart uses expense entries; the bar chart compares totals from the loaded transactions.
5. Set a monthly limit for an expense category. Use **Edit** to change its limit or **Remove** to delete it.
6. Use **Logout** to end the current client session.

## API overview

All API routes are mounted under `/api`. Routes marked **Protected** require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Path                 | Access | Purpose                                           |
| ------ | -------------------- | ------ | ------------------------------------------------- |
| `POST` | `/api/auth/register` | Public | Create an account with name, email, and password. |
| `POST` | `/api/auth/login`    | Public | Verify credentials and return a JWT.              |

### Transactions

| Method   | Path                          | Access    | Purpose                                                                                                                                  |
| -------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/transactions`           | Protected | List the signed-in user's transactions. Supports `type`, `category`, `startDate`, and `endDate` query parameters.                        |
| `GET`    | `/api/transactions/summary`   | Protected | Return income, expense, balance, and transaction totals.                                                                                 |
| `GET`    | `/api/transactions/breakdown` | Protected | Return totals grouped by category.                                                                                                       |
| `POST`   | `/api/transactions`           | Protected | Create a transaction.                                                                                                                    |
| `PUT`    | `/api/transactions/:id`       | Protected | Update allowed transaction fields: `title`, `amount`, `type`, `category`, and `date`. Ownership cannot be changed through this endpoint. |
| `DELETE` | `/api/transactions/:id`       | Protected | Delete a transaction owned by the signed-in user.                                                                                        |

### Budgets

| Method   | Path               | Access    | Purpose                                                                                      |
| -------- | ------------------ | --------- | -------------------------------------------------------------------------------------------- |
| `GET`    | `/api/budgets`     | Protected | Return the signed-in user's budgets with spending progress. Optional `month=YYYY-MM` filter. |
| `POST`   | `/api/budgets`     | Protected | Create a budget with `category`, numeric `limit`, and `month` (`YYYY-MM`).                   |
| `PUT`    | `/api/budgets/:id` | Protected | Update an existing budget's numeric `limit`.                                                 |
| `DELETE` | `/api/budgets/:id` | Protected | Delete a budget owned by the signed-in user.                                                 |

## Data and security

- User passwords are hashed with `bcryptjs`; the original password is not stored.
- JWTs currently expire after one day. The client stores its token in browser `localStorage` and attaches it to API requests.
- Transaction and budget routes verify the token. Database operations are scoped to the authenticated user.
- Production mode requires `CLIENT_URL`, `MONGO_URI`, and a `JWT_SECRET` of at least 32 characters.
- Production API requests are expected to arrive over HTTPS. Configure the hosting platform's TLS proxy correctly so Express can recognize secure requests.
- CORS controls which browser origins may read API responses; it is not a replacement for authentication.

## Production deployment notes

This repository is configured for local development and is **not deployment-ready without environment/configuration updates**:

1. Deploy the client and server to HTTPS-capable hosting.
2. Set `NODE_ENV=production` on the server.
3. Set `CLIENT_URL` to the exact public client origin (scheme and hostname, no path), `MONGO_URI` to the production database, and `JWT_SECRET` to a strong private random secret through the hosting provider's environment settings.
4. Confirm the hosting platform terminates TLS and forwards the HTTPS status correctly to Express.
5. Update the client API base URL in `client/src/api/axios.js`; it currently points to `http://localhost:5000/api` and will not reach a remotely deployed API.
6. Never upload `.env`, database credentials, or JWT secrets to GitHub. If a secret was ever committed, remove it from repository history as appropriate and rotate it immediately.

## Troubleshooting

### Client cannot contact the API

- Ensure the server is running and listening on port `5000`.
- Check that `client/src/api/axios.js` points to the correct API URL.
- Check the server's `CLIENT_URL` value and ensure it exactly matches the browser's client origin.
- Confirm MongoDB is available and `MONGO_URI` is correct.

### API reports an invalid or expired token

Sign out and sign in again. Tokens expire after one day. Check that the server uses the same `JWT_SECRET` consistently; changing it invalidates previously issued tokens.

### Server refuses to start in production mode

Set `CLIENT_URL`, `MONGO_URI`, and a `JWT_SECRET` with at least 32 characters in the hosting provider's environment settings. Do not use the literal placeholders from `.env.example`.

## Scripts and testing

### Client scripts (run from `client/`)

| Command           | Purpose                                |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start the Vite development server.     |
| `npm run build`   | Create the client production bundle.   |
| `npm run preview` | Preview a built client bundle locally. |
| `npm run lint`    | Run ESLint on the client source.       |

### Server scripts (run from `server/`)

The server currently has no start, lint, or automated test script. The `npm test` command is only a placeholder and exits with an error; no automated server test suite is configured yet.
