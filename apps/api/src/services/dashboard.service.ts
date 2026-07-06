import { Op } from "sequelize";
import { sequelize } from "@/config/database.js";
import { Booking, BookingItem, Category, Event, OrganizerProfile, Ticket, TicketType, User, Venue } from "@/models/index.js";
import { toBookingDto } from "@/services/booking.service.js";
import { toEventListItemDto } from "@/services/event.service.js";
import type { BookingDto, EventListItemDto } from "@eventsphere/shared";

export type DashboardRange = "7d" | "30d" | "90d" | "all";

function rangeStart(range: DashboardRange): Date | null {
  const days = { "7d": 7, "30d": 30, "90d": 90 }[range as "7d" | "30d" | "90d"];
  return days ? new Date(Date.now() - days * 24 * 3600 * 1000) : null;
}

export interface SeriesPoint {
  date: string;
  revenuePaise: number;
  bookings: number;
}

/** Revenue/bookings per day from confirmed+refunded-excluded bookings. */
async function revenueSeries(range: DashboardRange, eventIds?: number[]): Promise<SeriesPoint[]> {
  const start = rangeStart(range);
  const where: Record<string, unknown> = { status: "confirmed" };
  if (start) where.createdAt = { [Op.gte]: start };
  if (eventIds) {
    if (eventIds.length === 0) return [];
    where.eventId = { [Op.in]: eventIds };
  }

  const rows = (await Booking.findAll({
    where,
    attributes: [
      [sequelize.fn("DATE", sequelize.col("created_at")), "day"],
      [sequelize.fn("SUM", sequelize.col("total_amount_paise")), "revenue"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: [sequelize.fn("DATE", sequelize.col("created_at"))],
    order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
    raw: true,
  })) as unknown as { day: string; revenue: string; count: string }[];

  return rows.map((r) => ({ date: String(r.day), revenuePaise: Number(r.revenue), bookings: Number(r.count) }));
}

// ---------- Admin (docs/04 §15) ----------

export interface AdminDashboard {
  totals: {
    users: number;
    organizers: number;
    publishedEvents: number;
    pendingApprovals: number;
    confirmedBookings: number;
    revenuePaise: number;
  };
  revenueSeries: SeriesPoint[];
  bookingsByCategory: { category: string; bookings: number }[];
  recentBookings: BookingDto[];
}

export async function adminDashboard(range: DashboardRange): Promise<AdminDashboard> {
  const [users, organizers, publishedEvents, pendingApprovals, confirmedBookings, revenue, series, byCategory, recent] =
    await Promise.all([
      User.count(),
      OrganizerProfile.count({ where: { approvalStatus: "approved" } }),
      Event.count({ where: { status: "published" } }),
      Event.count({ where: { status: "pending_approval" } }),
      Booking.count({ where: { status: "confirmed" } }),
      Booking.sum("totalAmountPaise", { where: { status: "confirmed" } }),
      revenueSeries(range),
      Booking.findAll({
        where: { status: "confirmed" },
        attributes: [[sequelize.fn("COUNT", sequelize.col("Booking.id")), "count"]],
        include: [
          {
            model: Event,
            as: "event",
            attributes: [],
            required: true,
            paranoid: false,
            include: [{ model: Category, as: "category", attributes: ["name"], required: true }],
          },
        ],
        group: ["event.category.id", "event.category.name"],
        raw: true,
      }) as unknown as Promise<{ "event.category.name": string; count: string }[]>,
      Booking.findAll({
        include: [
          { model: Event, as: "event", include: [{ model: Venue, as: "venue" }], paranoid: false },
          { model: User, as: "attendee", paranoid: false },
          {
            model: BookingItem,
            as: "items",
            include: [
              { model: TicketType, as: "ticketType" },
              { model: Ticket, as: "tickets" },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

  return {
    totals: {
      users,
      organizers,
      publishedEvents,
      pendingApprovals,
      confirmedBookings,
      revenuePaise: revenue ?? 0,
    },
    revenueSeries: series,
    bookingsByCategory: byCategory.map((r) => ({ category: r["event.category.name"], bookings: Number(r.count) })),
    recentBookings: recent.map((b) => toBookingDto(b, true)),
  };
}

// ---------- Organizer ----------

export interface OrganizerDashboard {
  totals: {
    events: number;
    published: number;
    pendingApprovals: number;
    ticketsSold: number;
    revenuePaise: number;
    attendanceRate: number;
  };
  revenueSeries: SeriesPoint[];
  upcomingEvents: EventListItemDto[];
}

export async function organizerDashboard(organizerId: number, range: DashboardRange): Promise<OrganizerDashboard> {
  const events = await Event.findAll({ where: { organizerId }, attributes: ["id", "status"] });
  const eventIds = events.map((e) => e.id);

  const [ticketsSoldRaw, revenue, series, upcoming, checkedInStats] = await Promise.all([
    eventIds.length
      ? TicketType.sum("quantitySold", { where: { eventId: { [Op.in]: eventIds } } })
      : Promise.resolve(0),
    eventIds.length
      ? Booking.sum("totalAmountPaise", { where: { status: "confirmed", eventId: { [Op.in]: eventIds } } })
      : Promise.resolve(0),
    revenueSeries(range, eventIds),
    Event.findAll({
      where: { organizerId, status: "published", startTime: { [Op.gt]: new Date() } },
      include: [
        { model: Venue, as: "venue" },
        { model: Category, as: "category" },
        { model: TicketType, as: "ticketTypes" },
      ],
      order: [["startTime", "ASC"]],
      limit: 5,
    }),
    eventIds.length
      ? (sequelize.query(
          `SELECT
             SUM(CASE WHEN t.status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in,
             SUM(CASE WHEN t.status != 'cancelled' THEN 1 ELSE 0 END) AS admissible
           FROM tickets t
           JOIN booking_items bi ON bi.id = t.booking_item_id
           JOIN bookings b ON b.id = bi.booking_id
           WHERE b.event_id IN (:eventIds)`,
          { replacements: { eventIds }, plain: true },
        ) as Promise<{ checked_in: string | null; admissible: string | null } | null>)
      : Promise.resolve(null),
  ]);

  const checkedIn = Number(checkedInStats?.checked_in ?? 0);
  const admissible = Number(checkedInStats?.admissible ?? 0);

  return {
    totals: {
      events: events.length,
      published: events.filter((e) => e.status === "published").length,
      pendingApprovals: events.filter((e) => e.status === "pending_approval").length,
      ticketsSold: ticketsSoldRaw ?? 0,
      revenuePaise: revenue ?? 0,
      attendanceRate: admissible > 0 ? Math.round((checkedIn / admissible) * 100) : 0,
    },
    revenueSeries: series,
    upcomingEvents: upcoming.map(toEventListItemDto),
  };
}

// ---------- Attendee ----------

export interface AttendeeDashboard {
  upcomingBookings: BookingDto[];
  totals: { confirmed: number; attended: number };
}

export async function attendeeDashboard(attendeeId: number): Promise<AttendeeDashboard> {
  const [upcoming, confirmed, attended] = await Promise.all([
    Booking.findAll({
      where: { attendeeId, status: "confirmed" },
      include: [
        {
          model: Event,
          as: "event",
          where: { startTime: { [Op.gt]: new Date() } },
          include: [{ model: Venue, as: "venue" }],
          paranoid: false,
        },
        {
          model: BookingItem,
          as: "items",
          include: [
            { model: TicketType, as: "ticketType" },
            { model: Ticket, as: "tickets" },
          ],
        },
      ],
      order: [[sequelize.col("event.start_time"), "ASC"]],
      limit: 5,
      subQuery: false,
    }),
    Booking.count({ where: { attendeeId, status: "confirmed" } }),
    sequelize.query(
      `SELECT COUNT(DISTINCT b.id) AS attended
       FROM bookings b
       JOIN booking_items bi ON bi.booking_id = b.id
       JOIN tickets t ON t.booking_item_id = bi.id
       WHERE b.attendee_id = :attendeeId AND t.status = 'checked_in'`,
      { replacements: { attendeeId }, plain: true },
    ) as Promise<{ attended: string } | null>,
  ]);

  return {
    upcomingBookings: upcoming.map((b) => toBookingDto(b)),
    totals: { confirmed, attended: Number(attended?.attended ?? 0) },
  };
}
