# 10 — Deployment Strategy & Future Enhancements

## 1. Deployment Targets (free-tier friendly)

| Component | Primary choice | Alternative | Notes |
|---|---|---|---|
| Frontend (static SPA) | **Vercel** | Netlify | Auto-deploy from GitHub `main`; SPA rewrite to `index.html`; env: `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID` |
| Backend (Node API) | **Render** (web service) | Railway | Build `npm run build`, start `node dist/server.js`; health check `/api/v1/health` |
| MySQL | **Railway MySQL** | Aiven free / PlanetScale* | *PlanetScale lacks FK constraints — prefer Railway/Aiven since the schema relies on FKs |
| Images | Cloudinary (free tier) | — | Already CDN-backed |
| Email | Brevo SMTP free tier | Gmail SMTP (dev only) | Nodemailer just needs SMTP creds |
| Payments | Razorpay test mode | — | Webhook URL: `https://<api-host>/api/v1/payments/webhook` |
| Cron | in-process `node-cron` | — | Caveat below |

### Free-tier caveats to design around

- **Render free instances sleep** after inactivity: first request is slow, and in-process cron doesn't run while asleep. Mitigation: an external ping (e.g. UptimeRobot every 10 min) keeps the instance warm and the expiry/reminder crons effective. Booking expiry is *also* enforced lazily — the payment-confirm and booking-read paths treat `expires_at < now` as expired regardless of the cron, so correctness never depends on the scheduler.
- **Razorpay webhooks need a public URL** — for local dev use `ngrok`/`localtunnel` or rely on the client `verify` path (webhook idempotency makes both-arriving safe).

## 2. Environments & Pipeline

| Env | Frontend | API | DB | Purpose |
|---|---|---|---|---|
| local | Vite dev :5173 | ts-node-dev :5000 | local MySQL / Docker | development |
| production | Vercel | Render | Railway MySQL | demo/viva + report screenshots |

Pipeline (GitHub):

1. Push to feature branch → PR → CI (GitHub Actions): `tsc --noEmit`, ESLint, backend unit tests.
2. Merge to `main` → Vercel + Render auto-deploy.
3. Migrations run on deploy via `npx sequelize-cli db:migrate` in the Render release/prestart step (never `sync({ alter: true })` in production).
4. Seed once manually (`db:seed:all`) for the super admin + base data.

### Production checklist

- [ ] All env vars set on both platforms; distinct strong secrets (JWT/QR/webhook)
- [ ] CORS origin = exact Vercel URL; cookies `Secure` + `SameSite=Strict`
- [ ] Razorpay webhook registered with the deployed URL and its secret stored
- [ ] HTTPS-only, helmet enabled, rate limiters on
- [ ] DB backups: Railway automated + weekly manual dump before the viva
- [ ] Uptime ping configured; `/health` returns build version

## 3. Future Enhancements

Beyond Phase 2 ([01 §2.1](01-overview-scope.md)) — genuine product roadmap items, useful for the report's "Future Scope" chapter:

| Enhancement | Value | Sketch |
|---|---|---|
| Real-time updates (Socket.IO) | Live availability on event pages, live check-in counters | WS channel per event; invalidate React Query caches on push |
| Automated refunds | Full self-serve cancellation | Razorpay Refund API + `refunds` state machine + webhook `refund.processed` |
| Recurring & multi-session events | Conferences, workshops series | `event_sessions` table; per-session tickets & check-in |
| Seat maps | Reserved seating for theatres | Venue seat-layout JSON + per-seat inventory rows + seat-hold TTL |
| Discount coupons & early-bird pricing | Sales growth lever | `coupons` table, price rules evaluated server-side at booking |
| Organizer payouts | True marketplace | Razorpay Route/linked accounts; platform-fee ledger |
| Search upgrade | Better discovery | MySQL FULLTEXT → Meilisearch/Elasticsearch with facets |
| PWA + wallet passes | Offline tickets | Service worker; Google Wallet / Apple Wallet pass generation |
| Analytics upgrade | Organizer insights | Funnel (views → bookings), cohort retention, heat-by-hour check-in charts |
| Multi-currency & i18n | Broader audience | Currency column already isolated (paise-int pattern generalizes to minor units) |
| Admin impersonation & support tooling | Ops efficiency | Scoped, audited "login as" with banner |
| Native mobile app | Attendee convenience | React Native sharing the API + query layer |

## 4. Scaling Path (when it outgrows free tiers)

1. Move API to a paid always-on instance; split cron into a worker process (BullMQ + Redis) — email/notifications become real queues.
2. MySQL read replicas for reports; nightly ETL to a reporting table instead of live aggregation.
3. CDN-cache public catalog endpoints (`Cache-Control` + ETag) — they are the read-heavy path.
4. Rate limiting and sessions to Redis when horizontal instances > 1.
