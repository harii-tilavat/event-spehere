import cron from "node-cron";
import { isProd } from "@/config/env.js";
import { expireStaleBookings } from "@/services/booking.service.js";

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
}
