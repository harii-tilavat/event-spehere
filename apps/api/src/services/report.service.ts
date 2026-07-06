import { Op, type WhereOptions } from "sequelize";
import { sequelize } from "@/config/database.js";
import { AppError } from "@/utils/app-error.js";
import { Booking, BookingItem, Event, Ticket, TicketType, User, Venue } from "@/models/index.js";

export interface ReportParams {
  from?: Date;
  to?: Date;
  /** restrict to this organizer's events (organizer role) */
  organizerId?: number;
}

async function scopedEventIds(organizerId?: number): Promise<number[] | null> {
  if (organizerId === undefined) return null;
  const events = await Event.findAll({ where: { organizerId }, attributes: ["id"], paranoid: false });
  return events.map((e) => e.id);
}

function dateWhere(params: ReportParams): WhereOptions {
  if (!params.from && !params.to) return {};
  return {
    createdAt: {
      ...(params.from ? { [Op.gte]: params.from } : {}),
      ...(params.to ? { [Op.lte]: params.to } : {}),
    },
  };
}

// ---------- Revenue: per-event rollup (docs/04 §16) ----------

export interface RevenueRow {
  eventTitle: string;
  eventStatus: string;
  city: string;
  confirmedBookings: number;
  ticketsSold: number;
  revenuePaise: number;
}

export async function revenueReport(params: ReportParams): Promise<RevenueRow[]> {
  const eventIds = await scopedEventIds(params.organizerId);
  if (eventIds && eventIds.length === 0) return [];

  const rows = (await Booking.findAll({
    where: {
      status: "confirmed",
      ...dateWhere(params),
      ...(eventIds ? { eventId: { [Op.in]: eventIds } } : {}),
    },
    attributes: [
      "eventId",
      [sequelize.fn("COUNT", sequelize.col("Booking.id")), "bookings"],
      [sequelize.fn("SUM", sequelize.col("total_amount_paise")), "revenue"],
    ],
    group: ["eventId"],
    raw: true,
  })) as unknown as { eventId: number; bookings: string; revenue: string }[];

  const events = await Event.findAll({
    where: { id: { [Op.in]: rows.map((r) => r.eventId) } },
    include: [
      { model: Venue, as: "venue" },
      { model: TicketType, as: "ticketTypes" },
    ],
    paranoid: false,
  });
  const byId = new Map(events.map((e) => [e.id, e]));

  return rows
    .map((r) => {
      const event = byId.get(r.eventId);
      return {
        eventTitle: event?.title ?? `Event #${r.eventId}`,
        eventStatus: event?.status ?? "unknown",
        city: event?.venue?.city ?? "",
        confirmedBookings: Number(r.bookings),
        ticketsSold: (event?.ticketTypes ?? []).reduce((sum, t) => sum + t.quantitySold, 0),
        revenuePaise: Number(r.revenue),
      };
    })
    .sort((a, b) => b.revenuePaise - a.revenuePaise);
}

// ---------- Bookings: row per booking ----------

export interface BookingRow {
  bookingNumber: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  status: string;
  totalAmountPaise: number;
  createdAt: string;
}

export async function bookingsReport(params: ReportParams): Promise<BookingRow[]> {
  const eventIds = await scopedEventIds(params.organizerId);
  if (eventIds && eventIds.length === 0) return [];

  const bookings = await Booking.findAll({
    where: { ...dateWhere(params), ...(eventIds ? { eventId: { [Op.in]: eventIds } } : {}) },
    include: [
      { model: Event, as: "event", paranoid: false },
      { model: User, as: "attendee", paranoid: false },
    ],
    order: [["createdAt", "DESC"]],
    limit: 5000,
  });

  return bookings.map((b) => ({
    bookingNumber: b.bookingNumber,
    eventTitle: b.event?.title ?? "",
    attendeeName: b.attendee?.name ?? "",
    attendeeEmail: b.attendee?.email ?? "",
    status: b.status,
    totalAmountPaise: b.totalAmountPaise,
    createdAt: b.createdAt.toISOString(),
  }));
}

// ---------- Attendance: per-event check-in rates ----------

export interface AttendanceRow {
  eventTitle: string;
  startTime: string;
  totalTickets: number;
  checkedIn: number;
  ratePercent: number;
}

export async function attendanceReport(params: ReportParams): Promise<AttendanceRow[]> {
  const eventIds = await scopedEventIds(params.organizerId);
  if (eventIds && eventIds.length === 0) return [];

  const rows = (await Ticket.findAll({
    attributes: [
      [sequelize.col("bookingItem.booking.event_id"), "eventId"],
      [sequelize.fn("SUM", sequelize.literal("CASE WHEN `Ticket`.`status` != 'cancelled' THEN 1 ELSE 0 END")), "total"],
      [sequelize.fn("SUM", sequelize.literal("CASE WHEN `Ticket`.`status` = 'checked_in' THEN 1 ELSE 0 END")), "checked"],
    ],
    include: [
      {
        model: BookingItem,
        as: "bookingItem",
        attributes: [],
        required: true,
        include: [
          {
            model: Booking,
            as: "booking",
            attributes: [],
            required: true,
            paranoid: false,
            where: eventIds ? { eventId: { [Op.in]: eventIds } } : {},
          },
        ],
      },
    ],
    group: [sequelize.col("bookingItem.booking.event_id")],
    raw: true,
  })) as unknown as { eventId: number; total: string; checked: string }[];

  const events = await Event.findAll({ where: { id: { [Op.in]: rows.map((r) => r.eventId) } }, paranoid: false });
  const byId = new Map(events.map((e) => [e.id, e]));

  return rows.map((r) => {
    const total = Number(r.total);
    const checked = Number(r.checked);
    const event = byId.get(r.eventId);
    return {
      eventTitle: event?.title ?? `Event #${r.eventId}`,
      startTime: event?.startTime.toISOString() ?? "",
      totalTickets: total,
      checkedIn: checked,
      ratePercent: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  });
}

// ---------- CSV ----------

function csvEscape(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: { key: keyof T; label: string }[]): string {
  const head = headers.map((h) => csvEscape(h.label)).join(",");
  const body = rows.map((row) => headers.map((h) => csvEscape(row[h.key])).join(",")).join("\n");
  return `${head}\n${body}\n`;
}

export function parseReportParams(query: Record<string, unknown>, organizerId?: number): ReportParams {
  const parse = (v: unknown): Date | undefined => {
    if (typeof v !== "string" || !v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new AppError(400, "VALIDATION_ERROR", "Invalid date filter");
    return d;
  };
  return { from: parse(query.from), to: parse(query.to), organizerId };
}
