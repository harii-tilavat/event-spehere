# EventSphere — Event Booking and Management Platform

EventSphere is a full-stack web platform where **organizers** create and manage events, **attendees** discover events, book tickets, pay online, and check in with QR tickets, and a **super admin** governs the whole system — approvals, users, categories, venues, revenue, and reports.

> MCA Final Year Capstone Project — Lovely Professional University (LPU)

**Status: implemented.** All MVP modules plus the Phase-2 wishlist, reviews, and notification-feed features are built and tested. See [Implementation notes](#implementation-notes) for local-development fallbacks.

## Technology Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`, `packages/ui`) |
| Frontend | React 18, TypeScript, Vite, React Router 7, TanStack React Query 5, Axios, React Hook Form, Zod, Tailwind CSS 4, shadcn/ui, Lucide, Framer Motion, Recharts, sonner |
| Backend | Node.js 20+, Express, TypeScript, node-cron |
| Database | MySQL 8 (Docker) with Sequelize ORM + sequelize-cli migrations |
| Auth | JWT access tokens (in-memory) + rotating refresh-token cookies, RBAC |
| Storage | Cloudinary, with a local-disk fallback for development |
| Email | Nodemailer (SMTP), with a console/DB-log fallback for development |
| Payments | Razorpay (test mode), with a mock gateway fallback that exercises the same HMAC verification |

## Getting Started

Prerequisites: Node ≥ 20, pnpm (`corepack enable pnpm`), Docker.

```bash
pnpm install

# 1. Start MySQL (host port 3307 — 3306 is often taken by a system MySQL)
docker compose up -d

# 2. Configure the API — the committed example works out of the box for dev
cp apps/api/.env.example apps/api/.env   # then set JWT_ACCESS_SECRET + QR_TICKET_SECRET (any 16+ chars)
cp apps/web/.env.example apps/web/.env

# 3. Create the schema and seed base data (super admin, categories, venues)
pnpm --filter api db:migrate
pnpm --filter api db:seed

# 4. Run everything
pnpm dev
```

- Web: http://localhost:5173 · API: http://localhost:5000/api/v1
- Seeded super admin: `admin@eventsphere.local` / `Admin@1234` (override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding).

Useful scripts: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm --filter api db:migrate:undo`.

## Implementation notes

The brief allows fallbacks when external services aren't configured — all three are provider-abstracted, so real credentials drop in via `.env` with no code changes:

- **Payments**: without `RAZORPAY_*` env vars the API issues mock orders and the checkout shows a test-gateway panel. Signature verification (`HMAC-SHA256(orderId|paymentId)`), idempotent confirmation, and the webhook handler are identical to the real flow.
- **Email**: without `SMTP_*` env vars, emails are logged to the API console and recorded in the `notifications` table (which also powers the in-app feed). Verification/reset links appear in the console log in dev.
- **Images**: without `CLOUDINARY_*` env vars, uploads are stored under `apps/api/uploads/` and served at `/uploads`.

Engineering conventions live in [CLAUDE.md](CLAUDE.md); the React Query data-layer recipes are in [docs/react-query.md](docs/react-query.md).

## Documentation

The complete Software Requirements Specification (SRS) and technical plan the implementation was built from:

| Doc | Contents |
|---|---|
| [01 — Overview & Scope](docs/01-overview-scope.md) | Vision, architect's review & improvements, functional and non-functional requirements, module breakdown, MVP vs Phase-2 scope |
| [02 — Roles & Permissions](docs/02-roles-permissions.md) | User roles and the full RBAC permission matrix |
| [03 — Database Design](docs/03-database-design.md) | ER diagram, all tables with columns and types, relationships, indexes |
| [04 — API Specification](docs/04-api-specification.md) | REST conventions and every endpoint per module |
| [05 — Architecture](docs/05-architecture.md) | System architecture, authentication flow, booking + payment sequence, React Query data flow |
| [06 — Frontend Plan](docs/06-frontend-plan.md) | Folder structure, full page list, routing and navigation flow, validation rules |
| [07 — Backend Plan](docs/07-backend-plan.md) | Layered folder structure, middleware chain, error handling, environment variables |
| [08 — Security](docs/08-security.md) | Password hashing, token storage, QR ticket signing, payment verification, OWASP considerations |
| [09 — Roadmap](docs/09-roadmap.md) | Phased development roadmap (all core phases complete) |
| [10 — Deployment & Future](docs/10-deployment-future.md) | Deployment strategy (free-tier friendly) and future enhancements |
| [react-query.md](docs/react-query.md) | Data-layer architecture and copy-paste recipes for new resources |

## Feature summary

- **Auth**: register (attendee/organizer), email verification, login, rotating refresh sessions with reuse detection, forgot/reset/change password, per-request RBAC.
- **Admin**: category/venue/user management, organizer approval queue, event approval workflow, global bookings + payments monitoring with refunds, CSV reports, platform dashboard.
- **Organizer**: event lifecycle (draft → approval → published → completed/cancelled), ticket types with capacity guards, per-event bookings, QR/manual check-in with live attendance, revenue dashboard, CSV reports, review replies.
- **Attendee**: browse/search/filter catalog, booking with 15-minute row-locked inventory holds, online payment, QR tickets with PDF download, booking history + cancellation, wishlist, reviews (attended-only), notification feed, profile management.
