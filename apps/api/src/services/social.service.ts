import type {
  Meta,
  NotificationDto,
  PaginationQuery,
  ReviewCreateInput,
  ReviewDto,
  ReviewSummaryDto,
} from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import {
  Booking,
  BookingItem,
  Category,
  Event,
  Notification,
  Review,
  Ticket,
  TicketType,
  User,
  Venue,
  Wishlist,
} from "@/models/index.js";

// ---------- Wishlist (docs/04 §13) ----------

export async function listWishlist(userId: number): Promise<Event[]> {
  const rows = await Wishlist.findAll({
    where: { userId },
    include: [
      {
        model: Event,
        as: "event",
        required: true,
        include: [
          { model: Venue, as: "venue" },
          { model: Category, as: "category" },
          { model: TicketType, as: "ticketTypes" },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return rows.map((w) => (w as Wishlist & { event: Event }).event);
}

export async function addToWishlist(userId: number, eventId: number): Promise<void> {
  const event = await Event.findByPk(eventId);
  if (!event || event.status !== "published") throw new AppError(404, "NOT_FOUND", "Event not found");
  await Wishlist.findOrCreate({ where: { userId, eventId }, defaults: { userId, eventId } });
}

export async function removeFromWishlist(userId: number, eventId: number): Promise<void> {
  await Wishlist.destroy({ where: { userId, eventId } });
}

export async function wishlistEventIds(userId: number): Promise<number[]> {
  const rows = await Wishlist.findAll({ where: { userId }, attributes: ["eventId"] });
  return rows.map((w) => w.eventId);
}

// ---------- Reviews (docs/04 §12) ----------

function toReviewDto(review: Review, viewerId?: number): ReviewDto {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    attendeeName: review.attendee?.name ?? "Attendee",
    organizerReply: review.organizerReply,
    repliedAt: review.repliedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    isMine: viewerId !== undefined && review.attendeeId === viewerId,
  };
}

export async function listReviews(
  eventId: number,
  query: PaginationQuery,
  viewerId?: number,
): Promise<{ reviews: ReviewDto[]; summary: ReviewSummaryDto; meta: Meta }> {
  const { rows, count } = await Review.findAndCountAll({
    where: { eventId },
    include: [{ model: User, as: "attendee", paranoid: false }],
    order: [["createdAt", "DESC"]],
    ...pageOptions(query),
  });
  const avg = (await Review.findOne({
    where: { eventId },
    attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avg"]],
    raw: true,
  })) as unknown as { avg: string | null } | null;

  return {
    reviews: rows.map((r) => toReviewDto(r, viewerId)),
    summary: { average: avg?.avg ? Math.round(Number(avg.avg) * 10) / 10 : 0, count },
    meta: buildMeta(query, count),
  };
}

/** Only attendees with a checked-in ticket for the event may review (docs/02). */
async function hasAttended(attendeeId: number, eventId: number): Promise<boolean> {
  const ticket = await Ticket.findOne({
    where: { status: "checked_in" },
    include: [
      {
        model: BookingItem,
        as: "bookingItem",
        required: true,
        include: [
          {
            model: Booking,
            as: "booking",
            required: true,
            where: { attendeeId, eventId },
            paranoid: false,
          },
        ],
      },
    ],
  });
  return !!ticket;
}

export async function createReview(attendeeId: number, eventId: number, input: ReviewCreateInput): Promise<ReviewDto> {
  const event = await Event.findByPk(eventId, { paranoid: false });
  if (!event) throw new AppError(404, "NOT_FOUND", "Event not found");
  if (!(await hasAttended(attendeeId, eventId))) {
    throw new AppError(403, "FORBIDDEN", "Only attendees who checked in can review this event");
  }
  const existing = await Review.findOne({ where: { eventId, attendeeId } });
  if (existing) throw new AppError(409, "CONFLICT", "You have already reviewed this event");

  const review = await Review.create({
    eventId,
    attendeeId,
    rating: input.rating,
    comment: input.comment ?? null,
    organizerReply: null,
    repliedAt: null,
  });
  const withUser = await Review.findByPk(review.id, { include: [{ model: User, as: "attendee", paranoid: false }] });
  return toReviewDto(withUser!, attendeeId);
}

export async function replyToReview(reviewId: number, organizerId: number, reply: string): Promise<ReviewDto> {
  const review = await Review.findByPk(reviewId, {
    include: [
      { model: Event, as: "event", paranoid: false },
      { model: User, as: "attendee", paranoid: false },
    ],
  });
  if (!review || review.event?.organizerId !== organizerId) throw new AppError(404, "NOT_FOUND", "Review not found");
  if (review.organizerReply) throw new AppError(409, "CONFLICT", "This review already has a reply");
  await review.update({ organizerReply: reply, repliedAt: new Date() });
  return toReviewDto(review);
}

export async function deleteReview(reviewId: number): Promise<void> {
  const review = await Review.findByPk(reviewId);
  if (!review) throw new AppError(404, "NOT_FOUND", "Review not found");
  await review.destroy();
}

// ---------- Notifications feed (docs/04 §14) ----------

export async function listNotifications(
  userId: number,
  query: PaginationQuery & { isRead?: boolean },
): Promise<{ notifications: NotificationDto[]; unread: number; meta: Meta }> {
  const where = { userId, ...(query.isRead !== undefined ? { isRead: query.isRead } : {}) };
  const [{ rows, count }, unread] = await Promise.all([
    Notification.findAndCountAll({ where, order: [["createdAt", "DESC"]], ...pageOptions(query) }),
    Notification.count({ where: { userId, isRead: false } }),
  ]);
  return {
    notifications: rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      channel: n.channel,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unread,
    meta: buildMeta(query, count),
  };
}

export async function markNotificationRead(userId: number, id: number): Promise<void> {
  const [affected] = await Notification.update({ isRead: true }, { where: { id, userId } });
  if (affected === 0) throw new AppError(404, "NOT_FOUND", "Notification not found");
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
}
