# 02 — User Roles & Permissions (RBAC)

## 1. Roles

| Role | Description | How obtained |
|---|---|---|
| `super_admin` | Full system administration: approvals, all data, reports, settings | Seeded account; cannot self-register |
| `organizer` | Creates and manages own events, tickets, bookings, attendance, revenue | Registers with organization details → admin approval |
| `attendee` | Discovers events, books tickets, pays, attends | Self-registration |

A user has exactly **one** role (stored on the `users` row). Organizer capability is gated additionally by `organizer_profiles.approval_status = 'approved'`.

### Ownership rule

Organizers may only act on resources they own (`events.organizer_id = current user`). Attendees may only act on their own bookings/profile. This **row-level ownership check happens in the service layer** on every query — RBAC middleware alone is not sufficient.

## 2. Permission Matrix

✅ allowed · 🔶 allowed on own resources only · ❌ denied

| Capability | Super Admin | Organizer | Attendee | Guest |
|---|---|---|---|---|
| **Auth & profile** |
| Register / login / reset password | ✅ | ✅ | ✅ | ✅ |
| Manage own profile & password | ✅ | ✅ | ✅ | ❌ |
| **Public catalog** |
| Browse/search published events | ✅ | ✅ | ✅ | ✅ |
| View event details | ✅ | ✅ | ✅ | ✅ |
| **Users** |
| List/view all users | ✅ | ❌ | ❌ | ❌ |
| Suspend/activate/delete users | ✅ | ❌ | ❌ | ❌ |
| **Organizers** |
| Apply as organizer | — | ✅ (self) | ✅ (upgrade) | ✅ (register) |
| Approve/reject organizer applications | ✅ | ❌ | ❌ | ❌ |
| Manage organizer profile | ✅ | 🔶 | ❌ | ❌ |
| **Categories & venues** |
| View categories/venues | ✅ | ✅ | ✅ | ✅ |
| CRUD categories | ✅ | ❌ | ❌ | ❌ |
| CRUD venues | ✅ | ❌ | ❌ | ❌ |
| **Events** |
| Create/edit/delete event | ✅ | 🔶 | ❌ | ❌ |
| Submit event for approval | ❌ | 🔶 | ❌ | ❌ |
| Approve/reject events | ✅ | ❌ | ❌ | ❌ |
| Publish (post-approval) / cancel event | ✅ | 🔶 | ❌ | ❌ |
| **Ticket types** |
| CRUD ticket types | ✅ | 🔶 | ❌ | ❌ |
| **Bookings** |
| Create booking (buy tickets) | ❌ | ❌ | ✅ | ❌ |
| View own bookings / download tickets | — | — | 🔶 | ❌ |
| Cancel own booking | — | — | 🔶 | ❌ |
| View bookings per event | ✅ | 🔶 | ❌ | ❌ |
| Monitor all bookings | ✅ | ❌ | ❌ | ❌ |
| **Payments** |
| Pay for booking / verify payment | ❌ | ❌ | 🔶 | ❌ |
| View all transactions & payment logs | ✅ | 🔶 (own events) | 🔶 (own) | ❌ |
| Initiate refund | ✅ | ❌ | ❌ | ❌ |
| **Attendance** |
| QR / manual check-in | ❌ | 🔶 | ❌ | ❌ |
| Attendance reports | ✅ | 🔶 | ❌ | ❌ |
| **Reviews [Phase 2]** |
| Write review (attended events) | ❌ | ❌ | 🔶 | ❌ |
| Reply to review | ❌ | 🔶 | ❌ | ❌ |
| Moderate/delete reviews | ✅ | ❌ | ❌ | ❌ |
| **Wishlist [Phase 2]** | ❌ | ❌ | 🔶 | ❌ |
| **Reports** |
| Platform-wide reports (revenue, growth, performance) | ✅ | ❌ | ❌ | ❌ |
| Own-event reports | — | 🔶 | ❌ | ❌ |
| Export CSV/PDF | ✅ | 🔶 | ❌ | ❌ |
| **System** |
| Application settings | ✅ | ❌ | ❌ | ❌ |
| Audit logs [Phase 2] | ✅ | ❌ | ❌ | ❌ |

## 3. Enforcement Layers

1. **Route guard (frontend):** role-scoped layout routes redirect unauthorized users — UX only, not security.
2. **`authenticate` middleware (backend):** verifies the access token, loads `req.user`.
3. **`authorize(...roles)` middleware (backend):** checks `req.user.role` against the route's allowed roles.
4. **Service-layer ownership checks:** every organizer/attendee query is scoped by owner ID (e.g., `WHERE organizer_id = :userId`); returns 404 (not 403) for resources outside scope to avoid leaking existence.
5. **State guards:** actions valid only in certain states (e.g., only `draft`/`rejected` events can be edited; only `pending_approval` can be approved) are enforced in services.

## 4. Session & Status Rules

- Suspended users (`users.status = 'suspended'`): all tokens rejected at the `authenticate` layer (status checked on each request via the user lookup).
- Unverified email: can log in but blocked from booking/creating events until verified (HTTP 403 with `EMAIL_NOT_VERIFIED` code).
- Organizer with `approval_status != 'approved'`: authenticated but organizer endpoints return 403 with `ORGANIZER_NOT_APPROVED`.
