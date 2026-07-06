import cron from "node-cron";
import { Op } from "sequelize";
import { isProd } from "@/config/env.js";
import { expireStaleBookings } from "@/services/booking.service.js";
import { Booking, Event, Notification, User, Venue } from "@/models/index.js";
import { sendEmailAsync } from "@/services/email.service.js";
import { eventReminderEmail } from "@/emails/templates.js";

/** T-24h reminder to every confirmed attendee, sent at most once per booking (docs/04 §16). */
async function sendEventReminders(): Promise<void> {
  const windowStart = new Date(Date.now() + 24 * 3600 * 1000);
  const windowEnd = new Date(Date.now() + 25 * 3600 * 1000);

  const events = await Event.findAll({
    where: { status: "published", startTime: { [Op.gte]: windowStart, [Op.lt]: windowEnd } },
    include: [{ model: Venue, as: "venue" }],
  });

  for (const event of events) {
    const bookings = await Booking.findAll({
      where: { eventId: event.id, status: "confirmed" },
      include: [{ model: User, as: "attendee", paranoid: false }],
    });
    for (const booking of bookings) {
      if (!booking.attendee) continue;
      const alreadySent = await Notification.findOne({
        where: { userId: booking.attendee.id, type: "event_reminder", relatedType: "event", relatedId: event.id },
      });
      if (alreadySent) continue;
      const when = event.startTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
      const tpl = eventReminderEmail(booking.attendee.name, event.title, `${when} IST at ${event.venue?.name ?? "the venue"}`);
      sendEmailAsync({
        userId: booking.attendee.id,
        to: booking.attendee.email,
        type: "event_reminder",
        relatedType: "event",
        relatedId: event.id,
        ...tpl,
      });
    }
  }
}

/** published + ended → completed (docs/01 §2.5). */
async function completePastEvents(): Promise<number> {
  const [affected] = await Event.update(
    { status: "completed" },
    { where: { status: "published", endTime: { [Op.lt]: new Date() } } },
  );
  return affected;
}

/**
 * In-process cron (docs/10 §1). Correctness never depends on these — the
 * booking read/confirm paths also expire stale holds lazily.
 */
export function registerJobs(): void {
  // Release inventory held by abandoned checkouts (docs/03 §4)
  cron.schedule("* * * * *", async () => {
    try {
      const expired = await expireStaleBookings();
      if (expired > 0 && !isProd) console.log(`[jobs] expired ${expired} stale booking(s)`);
    } catch (err) {
      console.error("[jobs] expire-bookings failed:", err);
    }
  });

  // Hourly: T-24h reminders + auto-complete finished events
  cron.schedule("5 * * * *", async () => {
    try {
      await sendEventReminders();
      const completed = await completePastEvents();
      if (completed > 0 && !isProd) console.log(`[jobs] marked ${completed} event(s) completed`);
    } catch (err) {
      console.error("[jobs] hourly sweep failed:", err);
    }
  });
}
