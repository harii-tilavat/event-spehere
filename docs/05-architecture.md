# 05 — Application Architecture

## 1. System Context

```mermaid
flowchart LR
    subgraph Client["Browser (React SPA)"]
        UI[React + React Query + Axios]
    end
    subgraph Server["Node.js / Express API"]
        MW[Middleware: CORS, Helmet, Rate limit, Auth, Validation]
        SVC[Services / Business Logic]
        JOBS[Scheduled Jobs<br/>booking expiry · event reminders · mark completed]
    end
    DB[(MySQL<br/>Sequelize)]
    RZP[Razorpay<br/>Checkout + Webhooks]
    CLD[Cloudinary<br/>Images]
    SMTP[SMTP via Nodemailer<br/>Emails]

    UI -->|REST /api/v1| MW --> SVC --> DB
    UI -->|Razorpay Checkout JS| RZP
    RZP -->|webhook| MW
    SVC --> CLD
    SVC --> SMTP
    JOBS --> DB
    JOBS --> SMTP
```

Key properties:

- **Stateless API** — all session state lives in JWTs + the `refresh_tokens` table; horizontal scaling is trivial.
- **Layered backend** — `routes → controllers → services → models`; business rules live only in services (see [07](07-backend-plan.md)).
- **SPA frontend** — React Router for navigation, React Query as the server-state layer (see [06](06-frontend-plan.md)).
- **Jobs** — `node-cron` in-process for MVP: expire pending bookings (every minute), send 24 h event reminders (hourly), mark past events `completed` (hourly).

## 2. Authentication Flow (JWT + Refresh Rotation)

Access token: 15 min, in memory only (never localStorage). Refresh token: 7 days, httpOnly + Secure + SameSite=Strict cookie scoped to `/api/v1/auth`, hashed at rest, **rotated on every use**.

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as API
    participant D as MySQL

    B->>A: POST /auth/login (email, password)
    A->>D: find user, bcrypt.compare, status check
    A->>D: insert refresh_tokens (hash)
    A-->>B: accessToken (body) + refresh cookie

    Note over B: accessToken kept in memory (Axios interceptor)

    B->>A: GET /bookings/me (Bearer accessToken)
    A-->>B: 200 data

    Note over B: 15 min later — access token expired
    B->>A: GET /bookings/me → 401 TOKEN_EXPIRED
    B->>A: POST /auth/refresh (cookie)
    A->>D: validate hash, not expired/revoked
    A->>D: revoke old token, insert new (rotation)
    A-->>B: new accessToken + new cookie
    B->>A: retry GET /bookings/me → 200

    Note over A,D: Reuse of a revoked token ⇒ revoke entire chain (stolen-token defense)
```

Frontend implementation: a single Axios response interceptor catches 401 `TOKEN_EXPIRED`, queues concurrent requests, performs one refresh, then replays the queue; on refresh failure it clears auth state and redirects to `/login`.

## 3. Booking + Payment Sequence

```mermaid
sequenceDiagram
    participant U as Attendee (React)
    participant A as API
    participant D as MySQL
    participant R as Razorpay

    U->>A: POST /bookings {eventId, items}
    A->>D: TX: lock ticket_types FOR UPDATE,<br/>validate qty, quantity_sold += qty,<br/>insert booking(pending, expires 15m) + items
    A->>R: orders.create(amount, receipt=booking_number)
    A->>D: insert payments(created, order_id)
    A-->>U: 201 {booking, razorpayOrder}

    U->>R: Razorpay Checkout modal (keyId, orderId)
    R-->>U: payment done {payment_id, signature}

    U->>A: POST /payments/verify {orderId, paymentId, signature}
    A->>A: HMAC_SHA256(orderId+"|"+paymentId, KEY_SECRET) == signature ?
    A->>D: TX (idempotent): payment→captured,<br/>booking→confirmed, expires_at=NULL,<br/>generate tickets (code+QR)
    A--)U: 200 booking confirmed
    A--)A: async: send confirmation email + PDF tickets

    R--)A: POST /payments/webhook payment.captured
    A->>A: verify webhook signature
    A->>D: idempotent confirm (no-op if already captured)

    Note over A,D: cron each minute: pending & expired → status=expired,<br/>release quantity_sold
```

Failure paths:

- **User abandons checkout** → booking expires via cron, inventory released, UI shows `expired` status.
- **Verify never arrives but webhook does** → webhook confirms; UI picks it up via query refetch on the booking page.
- **Signature mismatch** → 422, payment marked `failed`, booking stays `pending` until expiry.

## 4. React Query Data Flow

React Query owns **all server state**; no server data is copied into local state (Context only for auth session + theme).

```mermaid
flowchart TD
    C[Component] -->|useQuery| QK["Query cache<br/>keyed by queryKeys"]
    QK -->|cache miss / stale| AX[Axios instance<br/>auth + refresh interceptors]
    AX --> API[(REST API)]
    C -->|useMutation| MU[Mutation]
    MU --> AX
    MU -->|onSuccess| INV["invalidateQueries(related keys)"]
    INV --> QK
    MU -->|onError| TOAST[sonner toast from error envelope]
```

**Query key factory** (single source of truth, `src/lib/query-keys.ts`):

```ts
export const qk = {
  events:   { list: (f: EventFilters) => ['events', 'list', f] as const,
              detail: (slug: string) => ['events', 'detail', slug] as const },
  myEvents: (f?: Filters) => ['organizer', 'events', f] as const,
  bookings: { mine: (f?: Filters) => ['bookings', 'me', f] as const,
              detail: (id: number) => ['bookings', id] as const },
  dashboard: (role: Role, range: string) => ['dashboard', role, range] as const,
  categories: ['categories'] as const,
  venues: (f?: Filters) => ['venues', f] as const,
  me: ['auth', 'me'] as const,
};
```

**Invalidation map** (mutation → keys invalidated):

| Mutation | Invalidates |
|---|---|
| create/update/submit/cancel event | `['organizer','events']`, `['events']`, `['dashboard']` |
| approve/reject event (admin) | `['admin','events']`, `['events']` |
| create booking / verify payment | `['bookings']`, `['events','detail', slug]` (availability), `['dashboard']` |
| check-in | `['events', id, 'attendance']` |
| category/venue CRUD | `['categories']` / `['venues']`, `['events']` |
| profile update | `['auth','me']` |

Defaults: `staleTime: 60_000` for catalog queries, `30_000` for dashboards; `retry: 1`; list queries use `placeholderData: keepPreviousData` for smooth pagination. Booking detail page polls (`refetchInterval: 3000`) while status is `pending` so webhook-confirmed payments appear without user action.

## 5. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| Validation | Zod schemas: frontend (React Hook Form resolver) + backend (`validate(schema)` middleware). Shared shapes documented in [06 §5](06-frontend-plan.md) |
| Error handling | Backend: `AppError(status, code, message)` + centralized handler → envelope. Frontend: interceptor maps envelope → toast; React Query error boundaries for page-level failures |
| Loading states | Route-level suspense skeletons + button-level pending states from `useMutation` |
| Config | `.env` on both sides; no secrets in the frontend bundle (only `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`) |
| Time | API speaks ISO-8601 UTC; UI formats with `Intl.DateTimeFormat` in the browser locale |
| Files | Images upload through the API to Cloudinary (server holds the secret); responses return CDN URLs |
