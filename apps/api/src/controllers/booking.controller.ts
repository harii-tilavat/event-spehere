import type { BookingListQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as bookingService from "@/services/booking.service.js";
import { toBookingDto } from "@/services/booking.service.js";

export const create = asyncHandler(async (req, res) => {
  const { booking, checkout } = await bookingService.createBooking(req.user!.id, req.body);
  ok(res, "Booking held — complete payment within 15 minutes", { booking: toBookingDto(booking), checkout }, { status: 201 });
});

export const listMine = asyncHandler(async (req, res) => {
  const { rows, meta } = await bookingService.listMine(req.user!.id, req.query as unknown as BookingListQuery);
  ok(res, "Your bookings", { bookings: rows.map((b) => toBookingDto(b)) }, { meta });
});

export const detail = asyncHandler(async (req, res) => {
  const { booking, includeAttendee } = await bookingService.getBookingForViewer(Number(req.params.id), {
    id: req.user!.id,
    role: req.user!.role,
  });
  ok(res, "Booking", { booking: toBookingDto(booking, includeAttendee) });
});

export const cancel = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(Number(req.params.id), req.user!.id);
  ok(res, "Booking cancelled", { booking: toBookingDto(booking) });
});

export const listForEvent = asyncHandler(async (req, res) => {
  const { rows, meta } = await bookingService.listForEvent(
    Number(req.params.eventId),
    req.user!.id,
    req.user!.role === "super_admin",
    req.query as unknown as BookingListQuery,
  );
  ok(res, "Event bookings", { bookings: rows.map((b) => toBookingDto(b, true)) }, { meta });
});

export const listAll = asyncHandler(async (req, res) => {
  const { rows, meta } = await bookingService.listAll(req.query as unknown as BookingListQuery);
  ok(res, "Bookings", { bookings: rows.map((b) => toBookingDto(b, true)) }, { meta });
});
