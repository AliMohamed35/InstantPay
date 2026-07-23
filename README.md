# 💸 InstantPay

> A backend API for a digital wallet / peer-to-peer money-transfer service, built with a
> **ledger-first** approach to correctness.
---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Advanced concepts (the interesting part)](#-advanced-concepts-the-interesting-part)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Roadmap](#roadmap)

---

## Overview

InstantPay lets a user register, verify their email, create one or more accounts (wallets / bank
accounts), and **transfer money between accounts safely** — even under concurrent requests.

The core design goal is that **money is never created or destroyed by accident**. Balances are
treated as a *cached projection* of an immutable, append-only **ledger** — the same model real
payment systems and banks use.

---

## Tech stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Runtime        | Node.js (native TypeScript execution, ESM)         |
| Language       | TypeScript                                         |
| Web framework  | Express 5                                          |
| ORM            | Sequelize 6                                        |
| Database       | MySQL                                              |
| Validation     | Joi                                                |
| Auth           | JWT (access + rotating refresh tokens)             |
| Hashing        | bcrypt (passwords, PINs, OTPs), SHA-256 (tokens)   |
| Email          | Nodemailer                                         |
| Logging        | Winston                                            |
| Rate limiting  | express-rate-limit                                 |
| Testing        | Vitest                                             |

---

## Architecture

A clean, layered structure — each request flows in one direction:

```
Route  →  Middleware (auth, validate, rate-limit)  →  Controller  →  Service  →  Repository  →  Model (DB)
```

- **Routes** wire HTTP verbs/paths to controllers and attach middleware.
- **Controllers** deal only with HTTP (read the request, call a service, shape the response).
- **Services** hold the business logic and own database transactions.
- **Repositories** wrap data access. A generic `AbstractRepository<Model>` provides
  `create / findOne / findAll / findById / update / delete / increment`, and every model-specific
  repository extends it — so data-access code isn't duplicated.
- **Models** define the schema and relationships.

Cross-cutting concerns are centralized: a single **error handler**, **custom exception** classes
that carry HTTP status codes, an **`asyncHandler`** wrapper so async controllers can't leak
unhandled rejections, and a consistent **`ApiResponse`** envelope (`{ success, message, data }`).

```
src/
├── DB/
│   ├── Models/          # User, Account, Transaction, LedgerEntry
│   ├── Repository/      # AbstractRepository (generic base)
│   └── connection.ts
├── Modules/
│   ├── Auth/            # register, login, verify, refresh, logout
│   ├── User/            # profile, balance, transfer
│   ├── Accounts/        # create / list / delete accounts
│   ├── Transactions/    # transaction repository
│   └── Ledger/          # ledger repository
├── middlewares/         # auth, joi validation, rate limiting, asyncHandler
├── Exceptions/          # custom exceptions + central handler
├── utilities/           # jwt, bcrypt, sha256, otp, mailer, logger, apiResponse
└── index.ts             # bootstrap
```

---

## 🧠 Advanced concepts (the interesting part)

These are the parts that go beyond a typical CRUD project. Each one is here because moving money
correctly is *hard*, and doing it naively (`UPDATE balance = balance + x`) breaks in ways that lose
real money.

### 1. Double-entry ledger — balance is a cache, not the truth

Instead of storing a balance and mutating it, every money movement is recorded as an immutable set
of **ledger entries**. A transfer of 50 writes two signed lines under one transaction:

```
transaction: TRANSFER  (header, has a status + reference number)
  ├── ledger entry: sender   account  −50   (debit)
  └── ledger entry: receiver account  +50   (credit)
```

The lines are **append-only and never updated** — a ledger entry is a historical *fact*, not a
mutable row. The sum of a transaction's entries is always zero, so money can never be created or
destroyed. An account's balance is just the running sum of its ledger entries; the `balance` column
is a **cached projection** of that history for fast reads.

> **Why it matters:** you can always re-derive and audit any balance from first principles. This is
> how banks, Stripe, and every serious payments system model money — and it's conceptually adjacent
> to *event sourcing*.

### 2. Race conditions & pessimistic locking

Two transfers from the same account at the same time is the classic banking race condition: both
read balance = 100, both think they can send 80, and you've just spent 160.

The transfer logic prevents this by running inside a **database transaction** and taking a
**pessimistic row lock** (`SELECT ... FOR UPDATE`) on both accounts before checking or changing any
balance. The second concurrent transfer *blocks* until the first commits, then re-reads the
now-correct balance.

```ts
await sequelize.transaction(async (t) => {
  const sender   = await accountRepository.findById(senderId,   { transaction: t, lock: t.LOCK.UPDATE });
  const receiver = await accountRepository.findById(receiverId, { transaction: t, lock: t.LOCK.UPDATE });
  // balance check + ledger writes + balance updates all happen atomically here
});
```

Because the check and the write happen *inside the same locked transaction*, the whole operation is
**atomic**: either every step commits, or nothing does.

### 3. Money is `DECIMAL`, never a float

Balances and ledger amounts use `DECIMAL(19,4)`. Floating-point (`0.1 + 0.2 !== 0.3`) is unusable
for money. A custom Sequelize getter converts the DB's string representation to a number only on the
way out, preserving precision in storage.

### 4. Rotating refresh tokens with reuse detection

Auth uses short-lived **access tokens** + long-lived **refresh tokens**. Refresh tokens are:

- **hashed (SHA-256) before storage** — a database leak doesn't expose usable tokens;
- **rotated on every refresh** — each refresh issues a new token and atomically invalidates the old
  one via `UPDATE ... WHERE refresh_token = <oldHash>`. If that update affects 0 rows, the token was
  already used or forged, and the session is rejected.

Passwords, PINs, and OTPs are all hashed with **bcrypt**; OTPs additionally expire and have a
**capped attempt count** to resist brute force.

### 5. Failure handling & separation of concerns

- Custom exceptions (`NotFoundException`, `UnauthorizedException`, …) carry their own HTTP status.
- A single Express error handler logs 5xx with stack traces, logs 4xx as warnings, and **never leaks
  internal error details** to clients (5xx responses are a generic message).
- `asyncHandler` guarantees a rejected promise in any controller is routed to that handler.

### 6. Rate limiting

Login and OTP endpoints are throttled (`express-rate-limit`) to blunt brute-force and abuse.
---

## Data model

| Table            | Purpose                                                              |
| ---------------- | ------------------------------------------------------------------- |
| `users`          | Identity, credentials (hashed), verification & OTP state            |
| `accounts`       | Wallets / bank accounts; holds the **cached** `balance`             |
| `transactions`   | Header for a money movement: type, status, reference number         |
| `ledger_entries` | Immutable signed lines — the **source of truth** for all balances   |

**Relationships:** a `User` has many `Account`s; a `Transaction` has many `LedgerEntry` lines; each
`LedgerEntry` belongs to one `Account`.
---

## Getting started

### Prerequisites

- Node.js (a version with native `.ts` execution — see `.nvmrc` / your setup)  <!-- ✍️ pin your version -->
- MySQL running locally or in a container

### Installation

```bash
git clone <your-repo-url>
cd InstantPay
npm install
cp .env.example .env      # then fill in the values (see below)
```

### Running

```bash
npm run dev     # development, with auto-reload (nodemon)
npm start       # production
npm test        # run the test suite (Vitest)
```

The server exposes a health check at `GET /health`.

> ⚠️ **Note:** in non-production the schema is auto-created with `sequelize.sync()`. For real
> deployments this should be replaced with proper migrations (see [Roadmap](#roadmap)).

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable                              | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| `ACCESS_SECRET` / `REFRESH_SECRET`    | Long random strings for signing JWTs         |
| `ACCESS_EXPIRY` / `REFRESH_EXPIRY`    | Token lifetimes (e.g. `15m`, `7d`)           |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | MySQL credentials                            |
| `DB_HOST` / `DB_DIALECT`              | DB host and dialect (`mysql`)                |
| `PORT`                                | Server port (default `3000`)                 |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD`   | Nodemailer credentials for sending OTP email |

---

## API reference

### Auth — `/auth`

| Method | Path        | Auth | Description                          |
| ------ | ----------- | ---- | ------------------------------------ |
| POST   | `/register` | —    | Create an account, send OTP email    |
| POST   | `/verify`   | —    | Verify email with OTP                |
| POST   | `/otp`      | —    | Resend OTP                           |
| POST   | `/login`    | —    | Log in, receive access/refresh token |
| POST   | `/refresh`  | —    | Rotate tokens                        |
| POST   | `/logout`   | ✅   | Invalidate the refresh token         |

### Users — `/user`

| Method | Path              | Auth | Description                       |
| ------ | ----------------- | ---- | --------------------------------- |
| GET    | `/`               | ✅   | Get current user                  |
| PUT    | `/`               | ✅   | Full update                       |
| PATCH  | `/`               | ✅   | Partial update                    |
| POST   | `/`               | ✅   | Soft-delete current user          |
| POST   | `/reset-password` | ✅   | Change password (old → new)       |
| POST   | `/transfer`       | ✅   | **Transfer money between accounts** |
| POST   | `/:id`            | ✅   | Check an account's balance (PIN)  |
| POST   | `/recharge/:id`   | ✅   | Add test balance (simulation)     |

### Accounts — `/account`

| Method | Path        | Auth | Description                 |
| ------ | ----------- | ---- | --------------------------- |
| POST   | `/add`      | ✅   | Create an account           |
| GET    | `/accounts` | ✅   | List the user's accounts    |
| GET    | `/:id`      | ✅   | Get account by id           |
| GET    | `/`         | ✅   | Get account by number       |
| DELETE | `/:id`      | ✅   | Remove an account           |

---

## Roadmap

Concepts I'm planning to add to deepen the system (roughly in priority order):

- [ ] **Idempotency keys** on transfers — so a client retry can't double-charge
- [ ] **Tests** for the concurrent-transfer path + a DB `CHECK (balance >= 0)` constraint
- [ ] **Database migrations** to replace `sequelize.sync()`
- [ ] **Docker Compose** (app + MySQL + Redis) for one-command setup
- [ ] **Redis caching** for balance/account reads
- [ ] **Optimistic locking** (`version` column) as a contrast to the current pessimistic approach
- [ ] **Outbox pattern + message queue (RabbitMQ)** — publish `TransferCompleted` events for async work (notifications, etc.)
- [ ] **Observability** — Prometheus metrics + request tracing (on top of the existing structured logs)

---

## License
learning project.

## Author
Ali Mohamed
