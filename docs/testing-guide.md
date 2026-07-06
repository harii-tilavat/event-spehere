# Testing Guide — every flow, step by step

How to manually verify each EventSphere flow in the browser, plus curl commands for the
edge cases a browser can't easily produce (races, replays, forged signatures).

## 0. Setup

```bash
docker compose up -d                 # MySQL on host port 3307
pnpm --filter api db:migrate
pnpm --filter api db:seed            # super admin + categories + venues
pnpm dev                             # web :5173, api :5000
```

**Accounts**

| Role | Email | Password | Notes |
|---|---|---|---|
| Super admin | `admin@eventsphere.local` | `Admin@1234` | seeded |
| Organizer (approved) | `organizer@test.dev` | `Organizer@1` | created during development testing |
| Attendee (verified) | `attendee@test.dev` | `NewPass@123` | created during development testing |

For a clean slate: `docker compose down -v && docker compose up -d`, wait ~20 s, re-run migrate + seed (the dev accounts above won't exist — recreate them via the flows below).

**Emails**: without SMTP configured, every email (verification link, reset link, booking
confirmation, reminders) is printed in the **API terminal** and recorded in the
`notifications` table. When a flow says "open the emailed link", copy it from the API logs.

**Payments**: without Razorpay keys, checkout shows a test-gateway panel with
**Pay** / **Simulate failed payment** buttons. Verification is the same HMAC path as production.

---

## 1. Registration & email verification (attendee)

1. `/register` → keep the **attendee** toggle → fill the form (password needs 8+ chars, an uppercase, a digit — try breaking each rule to see inline Zod errors).
2. You are logged in and land on the home page; the dashboard (`/account`) shows an **Unverified** banner.
3. Try to book any event → the detail page tells you to verify your email first.
4. Click **Resend verification email** in the banner → copy the `…/verify-email?token=…` link from the API terminal → open it → "Your email is verified".
5. Negative test: open the same link again → "invalid or expired" (single use).

## 2. Sessions, logout, forgot/reset password

- **Persistence**: log in, reload the page (F5) — you stay logged in (refresh-cookie bootstrap).
- **Logout**: topbar → Log out → reload → you're a guest.
- **Forgot password**: `/forgot-password` → submit any email → the response never reveals whether the account exists; if it does, the API terminal prints a reset link. Open it, set a new password, log in with it. The old link is now dead (single use) and all other sessions are revoked.
- **Rotation/reuse defense** (curl):

```bash
curl -s -c a.txt -X POST localhost:5000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"attendee@test.dev","password":"NewPass@123"}' -o /dev/null
curl -s -b a.txt -c b.txt -X POST localhost:5000/api/v1/auth/refresh -o /dev/null -w "rotate: %{http_code}\n"
curl -s -b a.txt -X POST localhost:5000/api/v1/auth/refresh -o /dev/null -w "replay old: %{http_code}\n"   # 401
curl -s -b b.txt -X POST localhost:5000/api/v1/auth/refresh -o /dev/null -w "family killed: %{http_code}\n" # 401
```

## 3. Organizer application & approval

1. `/register` → **organizer** toggle → organization name required.
2. The organizer dashboard shows a **Pending** banner; creating an event is blocked (403 `ORGANIZER_NOT_APPROVED` if you hit the API).
3. Log in as **admin** → `/admin/organizers` (defaults to the Pending filter) → ✓ approve (or ✗ reject with a reason — the decision email appears in the API logs and the applicant's dashboard shows the reason).
4. Log back in as the organizer → banner gone, event creation unlocked. Remember to verify the organizer's email too (same as flow 1) before creating events.

## 4. Admin catalog management

- `/admin/categories` — create (with image upload — stored locally under `apps/api/uploads/`), edit, deactivate, delete. Deleting a category that has events → blocked with a 409 toast.
- `/admin/venues` — create/edit/delete with search + pagination. Deleting a venue with upcoming published events → blocked.
- `/admin/users` — search, filter by role/status, suspend (user's sessions are revoked instantly — try refreshing their tab), reactivate, soft-delete. You cannot suspend yourself or another super admin.

## 5. Event lifecycle (organizer + admin)

1. As the approved organizer: `/organizer/events/new` → fill details (try `endTime` before `startTime` or a past start for inline errors) → **Create draft** → you're redirected to the editor.
2. **Submit for approval with no tickets** → blocked: "Add at least one active ticket type".
3. Add ticket types. Guard test: make quantities exceed the event capacity → 422 toast.
4. **Submit for approval** → status Pending approval. Public catalog (`/events`, incognito window) does **not** show it.
5. As admin: `/admin/approvals` → open the event page to review → approve (or reject with a reason; the organizer sees the reason banner in the editor and can edit + resubmit — edits are only allowed in draft/rejected).
6. After approval the event is in `/events`, searchable, with live ticket availability. As admin, `/admin/events` → star icon toggles **Featured** (floats to the top of the catalog).
7. Cancel test: organizer → My events → cancel a published event → every confirmed attendee gets a cancellation email (API logs).

## 6. Booking & payment (attendee)

1. As a verified attendee: open an event → **Book tickets**.
2. Quantity steppers respect per-booking and remaining limits. Select and **Proceed to payment**.
3. The pay step shows the booking number, a **15:00 countdown**, and the order summary.
4. **Simulate failed payment** → error toast, booking stays pending; you can retry while the hold lasts.
5. **Pay ₹…** → "Booking confirmed!", a confirmation email hits the API logs, and **View tickets** shows QR codes.
6. **Hold expiry**: create a booking, don't pay, either wait 15 min or fast-forward:

```bash
docker exec eventsphere-mysql mysql -uroot -peventsphere_dev eventsphere \
  -e "UPDATE bookings SET expires_at = NOW() - INTERVAL 1 MINUTE WHERE status='pending';"
# within a minute the cron expires it; the checkout page flips to "Hold expired → Start over"
# and the event's remaining count goes back up
```

7. **The race** (proves no double-selling) — create a 1-quantity ticket type, then:

```bash
BODY='{"eventId":<ID>,"items":[{"ticketTypeId":<TT_ID>,"quantity":1}]}'
curl -s -X POST localhost:5000/api/v1/bookings -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$BODY" & \
curl -s -X POST localhost:5000/api/v1/bookings -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$BODY" & wait
# exactly one succeeds; the other returns SOLD_OUT
```

## 7. Tickets, check-in & attendance

1. Attendee: `/account/bookings/:id` → each ticket shows a QR + **PDF** download (open the PDF — event, attendee, booking number, QR).
2. Organizer: `/organizer/check-in` → pick the event for live stats.
   - **Scan path**: paste the ticket's QR payload (the `CODE.signature` string — visible via the booking API, or scan the on-screen QR with the camera scanner) → "Checked in ✓".
   - **Replay**: submit the same payload again → "Already checked in at …".
   - **Forgery**: change one character of the signature → "QR signature is invalid".
   - **Manual path**: enter the booking number (`EVS-…`) → Find → per-ticket **Check in** buttons; or paste a bare ticket code in the left input.
3. Stats card updates live (checked-in count, rate, recent list).

## 8. Cancellation & refunds

1. Attendee: booking detail → **Cancel booking** (only confirmed + before event start) → tickets voided, seats released, cancellation email logged.
2. Admin: `/admin/payments` → filter Captured → **Refund** → payment + booking become refunded, tickets voided, inventory released. Refunded payments can't be refunded twice.

## 9. Wishlist, reviews, notifications, profile

- **Wishlist** (attendee): heart button on an event page toggles it; `/account/wishlist` lists saved events with remove buttons.
- **Reviews**: only attendees with a **checked-in** ticket can post (try before checking in → 403 toast "Only attendees who checked in…"). One review per event (the form disappears after posting). The event's organizer gets a one-time **Reply** button; admin can delete reviews.
- **Notifications**: `/account/notifications` — every email sent to you appears here; unread badge, click to mark read, **Mark all read**.
- **Profile** (all roles): update name/phone/avatar (topbar updates instantly), organizers also edit organization details; **Change password** requires the current password and logs out other devices (test with a second browser/incognito session).

## 10. Dashboards & reports

- `/admin` — revenue + bookings-by-category charts, totals, pending-approval hint, recent bookings; range picker (7d/30d/90d/all).
- `/organizer` — revenue, tickets sold, attendance rate, upcoming events.
- `/account` — confirmed/attended counts, upcoming bookings.
- `/admin/reports` and `/organizer/reports` — optional date range + three **Download CSV** buttons (open the files: revenue per event, bookings, attendance). Organizer exports contain only their own events.

## 11. Access-control spot checks

- Visit `/admin` as an attendee → redirected to your own home (UI guard).
- API-level (real enforcement): `curl -s localhost:5000/api/v1/users -H "Authorization: Bearer $ATTENDEE_TOKEN"` → 403.
- Organizer A cannot see organizer B's event in the editor or its bookings → 404 (existence masking).

## 12. Background jobs

- **Expiry** — every minute (see flow 6.6).
- **Auto-complete** — set a published event's `end_time` into the past (SQL like 6.6) → within the hour (or restart the API to re-register cron; runs at minute 5) it becomes `completed`.
- **T-24h reminder** — set a published event's `start_time` to ~24.5 h from now → the hourly job emails every confirmed attendee once (check API logs / notifications).
