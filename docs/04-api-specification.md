# 04 — REST API Specification

## 1. Conventions

- Base URL: `/api/v1`. JSON everywhere; `multipart/form-data` only for uploads.
- **Response envelope** (all endpoints):

```json
// success
{ "success": true, "message": "Booking confirmed", "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 } }
// error
{ "success": false, "message": "Validation failed", "code": "VALIDATION_ERROR", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

- **Auth:** `Authorization: Bearer <accessToken>` header. Refresh token travels only in an `httpOnly` cookie on `/auth/refresh` and `/auth/logout`.
- **List conventions** (apply to every list endpoint): `?page=1&limit=20&search=<q>&sortBy=<field>&sortOrder=asc|desc` plus endpoint-specific filters. `limit` max 100.
- **Status codes:** 200 OK · 201 Created · 204 No Content · 400 validation · 401 unauthenticated · 403 forbidden · 404 not found (also used for out-of-scope resources) · 409 conflict (state machine violations, sold out) · 422 semantic errors · 429 rate limited · 500 unexpected.
- **Error codes** (machine-readable, in `code`): `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `TOKEN_EXPIRED`, `ORGANIZER_NOT_APPROVED`, `SOLD_OUT`, `BOOKING_EXPIRED`, `INVALID_STATE`, `PAYMENT_VERIFICATION_FAILED`, `ALREADY_CHECKED_IN`, `NOT_FOUND`, `RATE_LIMITED`.

Role guard legend: 🌐 public · 🔑 any authenticated · 🅰️ super_admin · 🅾️ organizer (approved) · 🅿️ attendee. "own" = ownership-scoped.

## 2. Auth — `/auth`

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | Body: name, email, password, `role: 'attendee'|'organizer'`, organizer fields if organizer. Sends verification email. → 201 user (organizer starts `pending`) |
| POST | `/auth/login` | 🌐 | email + password → access token (body) + refresh cookie + user profile. Rate limited 5/min/IP |
| POST | `/auth/refresh` | cookie | Rotates refresh token → new access token + cookie. Reuse of a revoked token revokes the whole session family |
| POST | `/auth/logout` | 🔑 | Revokes refresh token, clears cookie → 204 |
| GET | `/auth/me` | 🔑 | Current user profile incl. organizer profile if any |
| POST | `/auth/verify-email` | 🌐 | Body: token → marks verified |
| POST | `/auth/resend-verification` | 🔑 | Re-sends link (rate limited) |
| POST | `/auth/forgot-password` | 🌐 | Body: email → always 200 (no user enumeration); emails reset link |
| POST | `/auth/reset-password` | 🌐 | Body: token, newPassword → resets, revokes all sessions |
| POST | `/auth/change-password` | 🔑 | Body: currentPassword, newPassword → revokes other sessions |

## 3. Users (admin) — `/users`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/users` | 🅰️ | List; filters: `role`, `status`; search on name/email |
| GET | `/users/:id` | 🅰️ | Details + booking summary |
| PATCH | `/users/:id/status` | 🅰️ | Body: `status: 'active'|'suspended'` |
| DELETE | `/users/:id` | 🅰️ | Soft delete → 204 |

Profile (self): 

| Method | Path | Guard | Description |
|---|---|---|---|
| PATCH | `/users/me` | 🔑 | name, phone, avatarUrl |

## 4. Organizers — `/organizers`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/organizers` | 🅰️ | List; filter `approvalStatus` |
| GET | `/organizers/:id` | 🅰️ | Application + profile details |
| PATCH | `/organizers/:id/approval` | 🅰️ | Body: `action: 'approve'|'reject'`, `reason?` → notification email |
| GET | `/organizers/me` | 🅾️(any status) | Own profile + approval status |
| PATCH | `/organizers/me` | 🅾️ | organizationName, description, website, logoUrl |

## 5. Categories — `/categories`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/categories` | 🌐 | Active categories (admin sees all with `?includeInactive=true`) |
| POST | `/categories` | 🅰️ | name, description, imageUrl → 201 |
| PATCH | `/categories/:id` | 🅰️ | Partial update incl. `isActive` |
| DELETE | `/categories/:id` | 🅰️ | 409 if events exist; otherwise delete |

## 6. Venues — `/venues`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/venues` | 🌐 | List; filter `city`; search on name |
| GET | `/venues/:id` | 🌐 | Details incl. facilities, map coordinates |
| POST | `/venues` | 🅰️ | Full venue body → 201 |
| PATCH | `/venues/:id` | 🅰️ | Partial update |
| DELETE | `/venues/:id` | 🅰️ | Soft delete; 409 if future published events |

## 7. Events

**Public catalog:**

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/events` | 🌐 | Published only. Filters: `categoryId`, `city`, `dateFrom`, `dateTo`, `priceMin`, `priceMax`, `featured`; full-text `search`; sort by `startTime|price|createdAt` |
| GET | `/events/:slug` | 🌐 | Details: images, venue, ticket types with availability (`remaining` derived, never raw counts trusted client-side) |

**Organizer:**

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/organizer/events` | 🅾️ own | All own events, any status; filter `status` |
| POST | `/events` | 🅾️ | Create as `draft` → 201 |
| PATCH | `/events/:id` | 🅾️ own | Edit; allowed only in `draft`/`rejected` (409 otherwise) |
| DELETE | `/events/:id` | 🅾️ own | Soft delete; only `draft`/`rejected` |
| POST | `/events/:id/submit` | 🅾️ own | `draft|rejected → pending_approval`; requires ≥1 ticket type |
| POST | `/events/:id/cancel` | 🅾️ own | `published → cancelled`; triggers attendee notifications |
| GET | `/events/:id/bookings` | 🅾️ own / 🅰️ | Bookings for one event; filter `status` |
| GET | `/events/:id/attendance` | 🅾️ own / 🅰️ | Check-in stats + ticket list |

**Admin approval:**

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/admin/events` | 🅰️ | All events; filter `status` (approval queue = `pending_approval`) |
| POST | `/events/:id/approve` | 🅰️ | `pending_approval → published`, sets `published_at` |
| POST | `/events/:id/reject` | 🅰️ | Body: reason → `rejected`, organizer notified |
| PATCH | `/events/:id/feature` | 🅰️ | Toggle `is_featured` |

## 8. Ticket Types — nested under events

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/events/:eventId/ticket-types` | 🌐 | Active types with availability |
| POST | `/events/:eventId/ticket-types` | 🅾️ own | name, pricePaise, quantityTotal, maxPerBooking, sale window → 201 |
| PATCH | `/ticket-types/:id` | 🅾️ own | Price/quantity edits blocked once sales exist (only `quantity_total` increase + `is_active` allowed) |
| DELETE | `/ticket-types/:id` | 🅾️ own | 409 if any bookings reference it; else delete |

## 9. Bookings — `/bookings`

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/bookings` | 🅿️ (verified email) | Body: `eventId`, `items: [{ticketTypeId, quantity}]`. Locks inventory, creates `pending` booking + Razorpay order. → 201 `{ booking, razorpayOrder: { orderId, amount, currency, keyId } }`. 409 `SOLD_OUT` if insufficient |
| GET | `/bookings/me` | 🅿️ | Own booking history; filter `status` |
| GET | `/bookings/:id` | 🅿️ own / 🅾️ event-own / 🅰️ | Booking + items + tickets + payment |
| POST | `/bookings/:id/cancel` | 🅿️ own | Confirmed → cancelled if before event start; marks refund requested |
| GET | `/admin/bookings` | 🅰️ | Global monitoring; filters: `status`, `eventId`, date range |

## 10. Payments — `/payments`

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/payments/verify` | 🅿️ own | Body: `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`. Server recomputes HMAC; on match → confirm booking (idempotent), generate tickets, email confirmation. On mismatch → 422 `PAYMENT_VERIFICATION_FAILED` |
| POST | `/payments/webhook` | Razorpay (signature header) | Handles `payment.captured`, `payment.failed`. Source of truth; idempotent by `razorpay_order_id`. Always 200 on processed |
| GET | `/payments` | 🅰️ | All transactions; filters: `status`, date range |
| GET | `/payments/me` | 🅿️ | Own transaction history |
| POST | `/payments/:id/refund` | 🅰️ | Initiates Razorpay refund (test mode); updates statuses [automation Phase 2] |

## 11. Tickets & Attendance

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/bookings/:id/tickets` | 🅿️ own | Tickets with QR payloads |
| GET | `/tickets/:code/pdf` | 🅿️ own | PDF ticket download (event, venue, QR) |
| POST | `/check-in` | 🅾️ own event / 🅰️ | Body: `qrPayload`. Verify HMAC → 200 `{ ticket, attendee }`; 409 `ALREADY_CHECKED_IN`; 422 invalid signature |
| POST | `/check-in/manual` | 🅾️ own event / 🅰️ | Body: `bookingNumber` or attendee email + eventId → lists tickets, check in selected |

## 12. Reviews [Phase 2] 

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/events/:id/reviews` | 🌐 | Paginated, with rating summary |
| POST | `/events/:id/reviews` | 🅿️ attended | rating 1–5, comment; one per attendee (409 duplicate) |
| POST | `/reviews/:id/reply` | 🅾️ own event | Single organizer reply |
| DELETE | `/reviews/:id` | 🅰️ | Moderation |

## 13. Wishlist [Phase 2] — `/wishlist`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/wishlist` | 🅿️ | Own wishlist with event cards |
| POST | `/wishlist/:eventId` | 🅿️ | Add (idempotent) |
| DELETE | `/wishlist/:eventId` | 🅿️ | Remove → 204 |

## 14. Notifications — `/notifications` [in-app: Phase 2]

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/notifications` | 🔑 | Own feed; filter `isRead` |
| PATCH | `/notifications/:id/read` | 🔑 own | Mark read |
| PATCH | `/notifications/read-all` | 🔑 | Mark all read |

## 15. Dashboards — `/dashboard`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/dashboard/admin` | 🅰️ | Totals (users, organizers, events, bookings, revenue), revenue time series, bookings by category, recent activity |
| GET | `/dashboard/organizer` | 🅾️ | Own events count, tickets sold, revenue series, attendance rate, upcoming events |
| GET | `/dashboard/attendee` | 🅿️ | Upcoming bookings, past events, wishlist count |

Query: `?range=7d|30d|90d|all` for time series.

## 16. Reports — `/reports`

All accept `?format=json|csv` (`pdf` Phase 2) and date range `?from&to`. CSV returns `text/csv` attachment.

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/reports/revenue` | 🅰️ / 🅾️(own) | Revenue by period, by event, by category |
| GET | `/reports/bookings` | 🅰️ / 🅾️(own) | Booking counts and statuses |
| GET | `/reports/attendance` | 🅰️ / 🅾️(own) | Check-in rates per event |
| GET | `/reports/events/:id/performance` | 🅰️ / 🅾️ own | Sales curve, sell-through %, revenue, attendance |
| GET | `/reports/organizers/performance` | 🅰️ | Per-organizer revenue/events/ratings |
| GET | `/reports/user-growth` | 🅰️ | Registrations over time |

## 17. Uploads — `/uploads`

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/uploads/image` | 🔑 | `multipart/form-data`; validates type (jpeg/png/webp) + size ≤ 2 MB; streams to Cloudinary → `{ url, publicId }`. Folder per entity type |

## 18. Settings [Phase 2] — `/settings`

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/settings` | 🅰️ | Key-value app settings |
| PATCH | `/settings` | 🅰️ | Update (platform fee %, support email, etc.) |
