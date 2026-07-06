import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as ticketService from "@/services/ticket.service.js";
import { toBookingDto } from "@/services/booking.service.js";

export const pdf = asyncHandler(async (req, res) => {
  const buffer = await ticketService.ticketPdf(req.params.code, { id: req.user!.id, role: req.user!.role });
  res
    .status(200)
    .setHeader("Content-Type", "application/pdf")
    .setHeader("Content-Disposition", `attachment; filename="eventsphere-ticket-${req.params.code}.pdf"`)
    .send(buffer);
});

function serializeResult(result: ticketService.CheckInResult) {
  return {
    ticket: {
      id: result.ticket.id,
      ticketCode: result.ticket.ticketCode,
      qrPayload: "", // not re-issued on check-in responses
      status: result.ticket.status,
      ticketTypeName: result.ticketTypeName,
      checkedInAt: result.ticket.checkedInAt?.toISOString() ?? null,
    },
    attendeeName: result.attendeeName,
    eventTitle: result.eventTitle,
  };
}

export const checkIn = asyncHandler(async (req, res) => {
  const result = await ticketService.checkInByQr(req.body.qrPayload, { id: req.user!.id, role: req.user!.role });
  ok(res, `Checked in: ${result.attendeeName}`, serializeResult(result));
});

export const manualCheckIn = asyncHandler(async (req, res) => {
  const result = await ticketService.checkInByCode(req.body.ticketCode, { id: req.user!.id, role: req.user!.role });
  ok(res, `Checked in: ${result.attendeeName}`, serializeResult(result));
});

export const lookup = asyncHandler(async (req, res) => {
  const { booking, eventTitle, attendeeName } = await ticketService.lookupBooking(req.body.bookingNumber, {
    id: req.user!.id,
    role: req.user!.role,
  });
  const dto = toBookingDto(booking, true);
  ok(res, "Booking found", {
    bookingNumber: dto.bookingNumber,
    attendeeName,
    eventTitle,
    tickets: dto.tickets,
  });
});

export const attendance = asyncHandler(async (req, res) => {
  const stats = await ticketService.attendanceForEvent(Number(req.params.eventId), {
    id: req.user!.id,
    role: req.user!.role,
  });
  ok(res, "Attendance", stats);
});
