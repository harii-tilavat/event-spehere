# 08 — Security Considerations

Threats and controls, mapped to where they are enforced.

## 1. Authentication & Sessions

| Control | Detail |
|---|---|
| Password hashing | bcrypt, cost 12. Never log or return password fields |
| Password policy | ≥8 chars, 1 uppercase, 1 digit (Zod both sides) |
| Access token | JWT HS256, 15 min TTL, payload only `{ sub, role }`; held in memory in the SPA — never localStorage/sessionStorage (XSS exfiltration) |
| Refresh token | 256-bit random string; httpOnly + Secure + SameSite=Strict cookie, path-scoped to `/api/v1/auth`; **SHA-256 hash at rest**; 7-day TTL |
| Rotation & reuse detection | Every refresh revokes the old token and issues a new one, linked via `replaced_by_id`. Presenting an already-revoked token revokes the entire chain (stolen-cookie defense) and forces re-login |
| Session invalidation | Logout revokes; password change/reset revokes all user tokens; suspended users fail the per-request status check in `authenticate` |
| Account enumeration | `/auth/forgot-password` and `/auth/register` return uniform responses/messages regardless of account existence |
| Brute force | `authLimiter`: 5 attempts/min/IP on login, forgot-password, resend-verification |
| Email tokens | Verification & reset tokens: random 256-bit, stored hashed, single-use, expiring (24 h / 1 h) |

## 2. Authorization

- Two-layer enforcement: `authorize(roles)` middleware + **service-layer ownership scoping** (`WHERE organizer_id/attendee_id = :userId`) — see [02 §3](02-roles-permissions.md).
- Out-of-scope resources return **404, not 403**, to avoid existence leaks.
- State-machine guards (event lifecycle, booking status, ticket single-use) enforced in services inside transactions — not just in the UI.

## 3. Payment Security

| Threat | Control |
|---|---|
| Client claims fake payment | Server recomputes `HMAC_SHA256(order_id + "\|" + payment_id, RAZORPAY_KEY_SECRET)` and compares to the signature; mismatch → 422, payment `failed` |
| Forged webhook | Webhook signature verified with `RAZORPAY_WEBHOOK_SECRET` against the **raw request body** (raw parser mounted before JSON) |
| Replayed verify/webhook | Idempotent confirmation keyed on `razorpay_order_id`; already-captured → no-op 200 |
| Amount tampering | Order amount computed **server-side** from DB ticket prices (price snapshot in `booking_items`); client never sends an amount |
| Double spend of inventory | Row-locked transaction + `quantity_sold ≤ quantity_total` invariant (see [03 §4](03-database-design.md)) |

## 4. QR Ticket Integrity

- QR payload = `ticketCode.base64url(HMAC_SHA256(ticketCode, QR_TICKET_SECRET))` — forging a valid QR requires the server secret.
- Check-in verifies the HMAC with a **constant-time comparison**, then atomically transitions `valid → checked_in` (`UPDATE ... WHERE status='valid'`, affected-rows check) — a screenshot of a used ticket fails with `ALREADY_CHECKED_IN`.
- Ticket codes are 16-char random (unguessable); PDFs fetched only by the owning attendee.

## 5. Input & Data Safety

| Vector | Control |
|---|---|
| SQL injection | Sequelize parameterized queries only; no raw string interpolation |
| XSS | React escapes by default; event descriptions rendered as plain text/sanitized markdown (no `dangerouslySetInnerHTML`); `helmet` CSP baseline |
| Mass assignment | Zod schemas whitelist fields; services build explicit attribute objects (never `Model.update(req.body)`) |
| File upload abuse | multer memory storage; MIME + extension check (jpeg/png/webp), ≤ 2 MB; re-uploaded to Cloudinary (never served from our disk); Cloudinary secret stays server-side |
| CSRF | State-changing routes require the Bearer header (not cookie-auth), so CSRF is inert; the refresh cookie is SameSite=Strict and its endpoint only re-issues tokens |
| Open redirect | Post-login `?redirect=` validated as a same-origin relative path |
| Rate abuse | Global `apiLimiter` + per-route sensitive limiters |
| Secrets | `.env` only (gitignored, `.env.example` committed); distinct secrets for JWT, QR, webhook; validated at boot |

## 6. Transport & Headers

- HTTPS everywhere in deployment (platform TLS); HSTS via helmet.
- `helmet()` defaults: X-Content-Type-Options, frameguard, hidePoweredBy, etc.
- CORS locked to the exact frontend origin with `credentials: true`.

## 7. Logging & Privacy

- Request logs exclude bodies for auth/payment routes; never log passwords, tokens, signatures, or full card/UPI details (Razorpay keeps PCI scope — we store only its IDs).
- Payment rows retained as an audit trail; soft deletes preserve booking history.
- Errors returned to clients are generic for 500s; stack traces only in server logs.

## 8. OWASP Top-10 Mapping (summary)

| OWASP 2021 | Covered by |
|---|---|
| A01 Broken Access Control | §2 two-layer RBAC + ownership + 404 masking |
| A02 Cryptographic Failures | bcrypt, hashed tokens, HMAC QR, TLS |
| A03 Injection | ORM parameterization, Zod validation |
| A04 Insecure Design | State machines, idempotency, inventory locking |
| A05 Security Misconfiguration | helmet, strict CORS, env validation at boot |
| A07 Identification & Auth Failures | Rotation + reuse detection, rate limits, strong policy |
| A08 Software & Data Integrity | Webhook signature over raw body, signed QR |
| A09 Logging & Monitoring | Central error handler + payment/audit trail |
