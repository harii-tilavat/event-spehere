# 01 — Overview, Architect's Review & Scope

## 1. Vision

EventSphere is a web-based Event Booking and Management Platform covering the complete event lifecycle: event creation and approval, ticket sales with online payment, QR-based attendance, and analytics — served through role-specific dashboards for **Super Admin**, **Organizer**, and **Attendee**.

The product goal for a capstone: demonstrate real-world, industry-grade engineering — clean architecture, correct handling of money and inventory, secure authentication, and a polished dark-themed SaaS-style UI.

## 2. Architect's Review of the Brief

The original brief is strong: clear roles, a sensible stack, and a realistic feature set. The following improvements are incorporated into this SRS. Each fixes a gap that would otherwise surface as a bug, a security hole, or a schedule overrun.

### 2.1 Scope control — the biggest risk

The brief lists ~15 modules. For a solo student on a fixed deadline, building all of them equally well is unrealistic; building half of them well and half of them badly looks worse in evaluation than a polished core plus documented extensions. Therefore the feature set is split:

- **MVP (must ship):** Authentication, User/Organizer/Category/Venue management, Event lifecycle with approval, Ticket types, Booking with inventory holds, Razorpay payment, QR tickets + check-in, role dashboards, email notifications, basic reports (CSV).
- **Phase 2 (build if time remains; designed now, stubbed later):** Reviews & ratings, Wishlist, Organizer team members, Seat selection, Audit logs, PDF report export, In-app notification center, App settings UI.

Everything in Phase 2 is still present in the database design and API plan (marked *Phase 2*) so it can be added without rework.

### 2.2 Booking integrity (correctness under concurrency)

Two users buying the last ticket at the same moment must not both succeed. Rules:

- Ticket inventory is decremented inside a **DB transaction with a row lock** (`SELECT ... FOR UPDATE` on the ticket type row).
- A booking follows a **state machine**: `pending → confirmed | expired | cancelled | refunded`.
- A `pending` booking **holds inventory with a TTL** (15 minutes). A scheduled job expires stale pending bookings and releases their inventory.

### 2.3 Payment correctness

- The Razorpay **signature is verified server-side** (`HMAC-SHA256` with the key secret). The client's claim that payment succeeded is never trusted.
- The **Razorpay webhook is the source of truth**; the client-side verify callback is an optimization for UX speed.
- Payment endpoints are **idempotent** — replays of the same webhook/verify call do not double-confirm a booking.
- All money is stored in **paise (integers)**, never floats. Single currency (INR) for MVP.

### 2.4 QR ticket security

A QR code that just contains a booking ID can be forged. Instead the QR encodes a **signed payload**: `ticketCode.HMAC(ticketCode, QR_SECRET)`. Check-in validates the signature server-side and enforces **single use** (a ticket transitions `valid → checked_in` exactly once, atomically).

### 2.5 Event lifecycle state machine

Events move through explicit states with a Super Admin approval gate:

```
draft → pending_approval → published → completed
              ↓                  ↓
           rejected          cancelled
```

Only `published` events are publicly visible and bookable. Cancelling a published event triggers attendee notification (and refund flow in Phase 2).

### 2.6 Other cross-cutting decisions

| Decision | Rationale |
|---|---|
| Soft deletes (Sequelize `paranoid`) on users, events, venues, bookings | Booking history and reports must survive deletion; supports auditability |
| Email is **asynchronous** (fire-and-forget with retry) | A slow SMTP server must never block a booking/payment response |
| Store all timestamps in **UTC**, render in the user's locale | Events and deadlines are time-critical |
| Consistent API response envelope + centralized error handler | Predictable client code, uniform toasts |
| Zod validation on the frontend, mirrored request validation on the backend | Never trust the client; identical rules both sides |
| Access token in memory, refresh token in an httpOnly cookie, with rotation | Mitigates XSS token theft; see [08 — Security](08-security.md) |

## 3. Functional Requirements

Grouped by module. **[P2]** marks Phase-2 items.

### FR-1 Authentication
- FR-1.1 Register as attendee with name, email, password; organizer registration requires organization details and admin approval.
- FR-1.2 Email verification via signed, expiring link before first login is fully enabled.
- FR-1.3 Login with email + password; returns access token (15 min) and sets refresh token cookie (7 days, rotated on use).
- FR-1.4 Logout revokes the refresh token server-side.
- FR-1.5 Forgot/reset password via emailed, expiring, single-use token.
- FR-1.6 Change password (authenticated) requires the current password and revokes other sessions.
- FR-1.7 All protected routes enforce RBAC per the matrix in [02](02-roles-permissions.md).

### FR-2 Dashboards
- FR-2.1 Each role gets a dedicated dashboard: statistic cards, charts (Recharts), recent activity.
- FR-2.2 Admin: total users, organizers, events, bookings, revenue; revenue over time; bookings by category.
- FR-2.3 Organizer: own events, tickets sold, revenue, attendance rate, upcoming events.
- FR-2.4 Attendee: upcoming bookings, past events, wishlist count [P2].

### FR-3 User Management (Admin)
- FR-3.1 List users with pagination, search (name/email), filter (role, status).
- FR-3.2 View user details incl. booking history.
- FR-3.3 Activate/suspend users; suspended users cannot log in.
- FR-3.4 Soft-delete users.

### FR-4 Organizer Management (Admin)
- FR-4.1 Organizer applications reviewed by admin: approve/reject with reason.
- FR-4.2 Organizer profile: organization name, description, logo, website.

### FR-5 Category Management (Admin)
- FR-5.1 CRUD categories with name, slug, description, image, active flag.
- FR-5.2 Inactive categories hidden from public browse but retained on existing events.

### FR-6 Venue Management (Admin)
- FR-6.1 CRUD venues: name, address, city, capacity, geo coordinates (Google Maps link), facilities, images.
- FR-6.2 Event capacity cannot exceed venue capacity.

### FR-7 Event Management (Organizer)
- FR-7.1 Create/edit events: title, description, category, venue, banner, gallery, schedule (start/end), registration deadline, capacity.
- FR-7.2 Define ticket types per event: name, price, quantity, max-per-booking, sale window.
- FR-7.3 Lifecycle per §2.5; organizers submit for approval; admin approves/rejects with reason.
- FR-7.4 Cancel a published event → attendees notified.
- FR-7.5 Public catalog: browse, full-text search on title, filter by category/city/date/price, sort, paginate.

### FR-8 Booking & Payment
- FR-8.1 Attendee selects ticket types + quantities → `pending` booking created, inventory held (TTL 15 min), Razorpay order created.
- FR-8.2 Successful payment (signature-verified) → booking `confirmed`, tickets generated, confirmation email with QR tickets sent.
- FR-8.3 Failed/abandoned payment → booking expires, inventory released.
- FR-8.4 Attendee can cancel a confirmed booking before the event; refund status tracked [refund automation P2].
- FR-8.5 Booking history with status for attendees; per-event booking lists for organizers; global monitoring for admin.

### FR-9 Tickets & Attendance
- FR-9.1 Each booked seat/unit yields a ticket with a unique code and signed QR.
- FR-9.2 Downloadable PDF ticket (event info + QR).
- FR-9.3 Organizer check-in screen: camera/QR input → validate signature → mark checked-in (single use).
- FR-9.4 Manual check-in fallback by booking number/email.
- FR-9.5 Attendance reports per event.

### FR-10 Notifications
- FR-10.1 Email: verification, password reset, booking confirmation (with tickets), payment receipt, event reminder (24 h before), event cancellation.
- FR-10.2 In-app notification center [P2].

### FR-11 Reviews [P2]
- FR-11.1 Attendees who attended can rate (1–5) and review once per event.
- FR-11.2 Organizer can reply once per review.

### FR-12 Reports
- FR-12.1 Admin: revenue, bookings, user growth, event & organizer performance.
- FR-12.2 Organizer: revenue, bookings, attendance for own events.
- FR-12.3 Export CSV (MVP), PDF [P2].

### FR-13 Settings
- FR-13.1 Profile management (name, avatar, phone) for all roles.
- FR-13.2 Password change.
- FR-13.3 Application settings (platform fee %, support email) [P2].

## 4. Non-Functional Requirements

| # | Requirement | Target |
|---|---|---|
| NFR-1 | Performance | API p95 < 500 ms on typical queries; paginated lists ≤ 20 items default |
| NFR-2 | Security | OWASP Top-10 aware: hashed passwords (bcrypt ≥ 10 rounds), parameterized queries via ORM, rate limiting on auth, signed QR, verified payments — see [08](08-security.md) |
| NFR-3 | Usability | Responsive (mobile-first breakpoints), dark theme, loading/empty/error states on every screen, toast feedback (sonner) |
| NFR-4 | Reliability | Booking/payment operations transactional; no double-sold tickets under concurrent load |
| NFR-5 | Maintainability | Layered backend, feature-based frontend, TypeScript strict mode, ESLint + Prettier |
| NFR-6 | Scalability | Stateless API (JWT) → horizontally scalable; DB indexes on all query paths (see [03](03-database-design.md)) |
| NFR-7 | Portability | Runs locally with `.env` config only; deployable to free tiers (see [10](10-deployment-future.md)) |
| NFR-8 | Auditability | Soft deletes; payment log trail; audit log table [P2] |

## 5. Module Breakdown

| Module | Owner role(s) | Phase | Docs |
|---|---|---|---|
| Authentication | All | MVP | FR-1, [05 §Auth flow](05-architecture.md) |
| Dashboards | All | MVP | FR-2 |
| User Management | Admin | MVP | FR-3 |
| Organizer Management | Admin | MVP | FR-4 |
| Category Management | Admin | MVP | FR-5 |
| Venue Management | Admin | MVP | FR-6 |
| Event Management | Organizer, Admin | MVP | FR-7 |
| Ticket Management | Organizer | MVP | FR-7.2, FR-9 |
| Booking | Attendee, Organizer, Admin | MVP | FR-8 |
| Payment | Attendee, system | MVP | FR-8, [05 §Payment sequence](05-architecture.md) |
| Attendance | Organizer | MVP | FR-9 |
| Notifications (email) | System | MVP | FR-10 |
| Reports (CSV) | Admin, Organizer | MVP | FR-12 |
| Settings/Profile | All | MVP | FR-13 |
| Reviews | Attendee, Organizer | Phase 2 | FR-11 |
| Wishlist | Attendee | Phase 2 | — |
| Team Members | Organizer | Phase 2 | — |
| Seat Selection | Attendee | Phase 2 | — |
| Audit Logs | Admin | Phase 2 | — |
| In-app Notifications | All | Phase 2 | FR-10.2 |

## 6. Design Language

Modern dark-first SaaS dashboard:

- Dark background palette (zinc/slate base via Tailwind + shadcn/ui theming), high-contrast text.
- Rounded cards (`rounded-2xl`), subtle borders, glassmorphism on overlays/hero only (avoid overuse on data-dense screens).
- Dashboard-first layouts: sidebar navigation per role, stat cards, Recharts visualizations.
- Framer Motion for page transitions and micro-interactions; keep durations ≤ 250 ms.
- Fully responsive; tables collapse to cards on mobile.
