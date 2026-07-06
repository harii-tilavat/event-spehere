import type { PaginationQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as socialService from "@/services/social.service.js";
import { toEventListItemDto } from "@/services/event.service.js";

// Wishlist
export const wishlist = asyncHandler(async (req, res) => {
  const events = await socialService.listWishlist(req.user!.id);
  ok(res, "Wishlist", { events: events.map(toEventListItemDto) });
});

export const wishlistIds = asyncHandler(async (req, res) => {
  ok(res, "Wishlist ids", { eventIds: await socialService.wishlistEventIds(req.user!.id) });
});

export const addWishlist = asyncHandler(async (req, res) => {
  await socialService.addToWishlist(req.user!.id, Number(req.params.eventId));
  ok(res, "Added to wishlist", null, { status: 201 });
});

export const removeWishlist = asyncHandler(async (req, res) => {
  await socialService.removeFromWishlist(req.user!.id, Number(req.params.eventId));
  res.status(204).end();
});

// Reviews
export const listReviews = asyncHandler(async (req, res) => {
  const { reviews, summary, meta } = await socialService.listReviews(
    Number(req.params.eventId),
    req.query as unknown as PaginationQuery,
    req.user?.id,
  );
  ok(res, "Reviews", { reviews, summary }, { meta });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await socialService.createReview(req.user!.id, Number(req.params.eventId), req.body);
  ok(res, "Review posted", { review }, { status: 201 });
});

export const replyReview = asyncHandler(async (req, res) => {
  const review = await socialService.replyToReview(Number(req.params.id), req.user!.id, req.body.reply);
  ok(res, "Reply posted", { review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await socialService.deleteReview(Number(req.params.id));
  res.status(204).end();
});

// Notifications
export const notifications = asyncHandler(async (req, res) => {
  const isRead = req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : undefined;
  const { notifications: items, unread, meta } = await socialService.listNotifications(req.user!.id, {
    ...(req.query as unknown as PaginationQuery),
    isRead,
  });
  ok(res, "Notifications", { notifications: items, unread }, { meta });
});

export const markRead = asyncHandler(async (req, res) => {
  await socialService.markNotificationRead(req.user!.id, Number(req.params.id));
  ok(res, "Marked read", null);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await socialService.markAllNotificationsRead(req.user!.id);
  ok(res, "All notifications marked read", null);
});
