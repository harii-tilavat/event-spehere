import type { Response } from "express";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as reportService from "@/services/report.service.js";
import { parseReportParams, toCsv } from "@/services/report.service.js";

function sendCsv(res: Response, filename: string, csv: string): void {
  res
    .status(200)
    .setHeader("Content-Type", "text/csv; charset=utf-8")
    .setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    .send(csv);
}

function scope(req: { user?: { id: number; role: string } }): number | undefined {
  return req.user!.role === "super_admin" ? undefined : req.user!.id;
}

export const revenue = asyncHandler(async (req, res) => {
  const rows = await reportService.revenueReport(parseReportParams(req.query, scope(req)));
  if (req.query.format === "csv") {
    sendCsv(
      res,
      "eventsphere-revenue.csv",
      toCsv(rows as unknown as Record<string, unknown>[], [
        { key: "eventTitle", label: "Event" },
        { key: "eventStatus", label: "Status" },
        { key: "city", label: "City" },
        { key: "confirmedBookings", label: "Confirmed bookings" },
        { key: "ticketsSold", label: "Tickets sold" },
        { key: "revenuePaise", label: "Revenue (paise)" },
      ]),
    );
    return;
  }
  ok(res, "Revenue report", { rows });
});

export const bookings = asyncHandler(async (req, res) => {
  const rows = await reportService.bookingsReport(parseReportParams(req.query, scope(req)));
  if (req.query.format === "csv") {
    sendCsv(
      res,
      "eventsphere-bookings.csv",
      toCsv(rows as unknown as Record<string, unknown>[], [
        { key: "bookingNumber", label: "Booking" },
        { key: "eventTitle", label: "Event" },
        { key: "attendeeName", label: "Attendee" },
        { key: "attendeeEmail", label: "Email" },
        { key: "status", label: "Status" },
        { key: "totalAmountPaise", label: "Amount (paise)" },
        { key: "createdAt", label: "Created" },
      ]),
    );
    return;
  }
  ok(res, "Bookings report", { rows });
});

export const attendance = asyncHandler(async (req, res) => {
  const rows = await reportService.attendanceReport(parseReportParams(req.query, scope(req)));
  if (req.query.format === "csv") {
    sendCsv(
      res,
      "eventsphere-attendance.csv",
      toCsv(rows as unknown as Record<string, unknown>[], [
        { key: "eventTitle", label: "Event" },
        { key: "startTime", label: "Starts" },
        { key: "totalTickets", label: "Tickets" },
        { key: "checkedIn", label: "Checked in" },
        { key: "ratePercent", label: "Rate %" },
      ]),
    );
    return;
  }
  ok(res, "Attendance report", { rows });
});
