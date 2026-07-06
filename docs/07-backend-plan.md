# 07 — Backend Plan (Node.js + Express + TypeScript)

Layered architecture: **routes → controllers → services → models**. Controllers are thin (parse → call service → respond); all business rules, state machines, transactions, and ownership checks live in services. Sequelize models carry no business logic beyond associations/scopes.

## 1. Folder Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .sequelizerc
└── src/
    ├── server.ts                     # bootstrap: env → db → cron → listen
    ├── app.ts                        # express app: middleware chain + routes + error handler
    ├── config/
    │   ├── env.ts                    # Zod-validated process.env → typed config (fail fast)
    │   ├── database.ts               # Sequelize instance
    │   ├── cloudinary.ts · mailer.ts · razorpay.ts
    ├── models/                       # Sequelize models + associations/index.ts
    │   ├── user.model.ts ─ refresh-token.model.ts ─ organizer-profile.model.ts
    │   ├── category.model.ts ─ venue.model.ts ─ event.model.ts ─ event-image.model.ts
    │   ├── ticket-type.model.ts ─ booking.model.ts ─ booking-item.model.ts
    │   ├── ticket.model.ts ─ payment.model.ts ─ notification.model.ts
    │   └── review.model.ts ─ wishlist.model.ts ─ audit-log.model.ts   # [P2]
    ├── migrations/                   # sequelize-cli, one per table in dependency order
    ├── seeders/                      # super admin, categories, demo venues/events
    ├── routes/
    │   ├── index.ts                  # mounts /api/v1/*
    │   └── auth.routes.ts ─ user.routes.ts ─ organizer.routes.ts ─ category.routes.ts
    │       ─ venue.routes.ts ─ event.routes.ts ─ ticket-type.routes.ts ─ booking.routes.ts
    │       ─ payment.routes.ts ─ checkin.routes.ts ─ dashboard.routes.ts ─ report.routes.ts
    │       ─ upload.routes.ts ─ notification.routes.ts
    ├── controllers/                  # one per route file, thin
    ├── services/
    │   ├── auth.service.ts           # register, login, refresh rotation, verify, reset
    │   ├── user.service.ts ─ organizer.service.ts ─ category.service.ts ─ venue.service.ts
    │   ├── event.service.ts          # CRUD + lifecycle state machine
    │   ├── booking.service.ts        # locked inventory TX, expiry, cancel
    │   ├── payment.service.ts        # order create, verify, webhook, refund (idempotent)
    │   ├── ticket.service.ts         # ticket gen, QR sign/verify, PDF, check-in
    │   ├── dashboard.service.ts ─ report.service.ts (CSV via fast-csv)
    │   └── email.service.ts          # async send w/ retry; templates
    ├── middlewares/
    │   ├── authenticate.ts           # Bearer JWT → req.user (fresh status check)
    │   ├── authorize.ts              # authorize('super_admin', ...)
    │   ├── validate.ts               # Zod schema → 400 envelope
    │   ├── rate-limit.ts             # express-rate-limit: authLimiter, apiLimiter
    │   ├── upload.ts                 # multer memory storage + type/size filter
    │   └── error-handler.ts          # AppError → envelope; unknown → 500 + log
    ├── validators/                   # Zod schemas per module (mirror of frontend rules)
    ├── jobs/
    │   ├── index.ts                  # node-cron registry
    │   ├── expire-bookings.job.ts    # every minute
    │   ├── event-reminders.job.ts    # hourly, T-24h emails
    │   └── complete-events.job.ts    # hourly, published+past → completed
    ├── emails/templates/             # verification, reset, booking-confirmation, reminder, cancellation (handlebars)
    ├── utils/
    │   ├── app-error.ts ─ async-handler.ts ─ pagination.ts ─ crypto.ts (HMAC, token gen)
    │   └── pdf.ts (pdfkit ticket) ─ qrcode.ts ─ booking-number.ts
    └── types/                        # express req augmentation, DTOs, enums
```

## 2. Middleware Chain (app.ts order)

1. `helmet()` — security headers
2. `cors({ origin: FRONTEND_URL, credentials: true })`
3. **Webhook route first** with `express.raw()` (Razorpay signature needs the raw body) — mounted before the JSON parser
4. `express.json({ limit: '1mb' })` + `cookie-parser`
5. `apiLimiter` (e.g. 300 req/15 min/IP); `authLimiter` (5 req/min) on login/forgot/resend
6. request logger (morgan dev / pino prod)
7. routes (`/api/v1`)
8. 404 handler → `AppError(404, 'NOT_FOUND')`
9. `error-handler` (last)

## 3. Error Handling

```ts
class AppError extends Error {
  constructor(public status: number, public code: ErrorCode, message: string,
              public errors?: FieldError[]) { super(message); }
}
```

- Controllers wrap async handlers (`asyncHandler`) so throws reach the central handler.
- Handler maps: `AppError` → its envelope; `ZodError` → 400 `VALIDATION_ERROR` with field errors; Sequelize unique violation → 409; anything else → 500 with generic message (details logged, never leaked).
- Every service throw uses an `AppError` with a machine code from the list in [04 §1](04-api-specification.md).

## 4. Validation

Every mutating route gets `validate(schema)` with a Zod schema in `validators/` that mirrors the frontend table in [06 §5](06-frontend-plan.md) exactly — the backend is the enforcement point, the frontend is UX. Schemas parse `body`, `params`, and `query` and coerce types (`z.coerce.number()` for query params).

## 5. Environment Variables (`.env.example`)

```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost  DB_PORT=3306  DB_NAME=eventsphere  DB_USER=root  DB_PASSWORD=

JWT_ACCESS_SECRET=            # 32+ random bytes
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=7
QR_TICKET_SECRET=             # HMAC key for QR payloads (distinct from JWT secrets)

CLOUDINARY_CLOUD_NAME=  CLOUDINARY_API_KEY=  CLOUDINARY_API_SECRET=

SMTP_HOST=  SMTP_PORT=587  SMTP_USER=  SMTP_PASS=  MAIL_FROM="EventSphere <no-reply@eventsphere.app>"

RAZORPAY_KEY_ID=rzp_test_...  RAZORPAY_KEY_SECRET=  RAZORPAY_WEBHOOK_SECRET=
```

`config/env.ts` validates all of these with Zod at boot and exits with a clear message if any are missing — no silent misconfiguration.

## 6. Conventions

- TypeScript strict; ESLint + Prettier; path alias `@/` → `src/`.
- All DB access through services; controllers never import models.
- Transactions via `sequelize.transaction(async t => ...)`; every multi-table write is transactional.
- Pagination helper returns `{ rows, meta }` consumed by the envelope.
- Emails: `email.service.ts` exposes `sendAsync(template, to, data)` — queues an immediate `setImmediate` send with 3 retries/backoff and logs failures to `notifications.sent_at = NULL`; callers never await delivery.
- Seeders create: 1 super admin (env-provided credentials), 8 categories, 3 venues, 2 demo organizers + sample events for development.
