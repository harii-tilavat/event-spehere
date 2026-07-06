import { Router } from "express";
import { z } from "zod";
import {
  idParamSchema,
  paginationQuerySchema,
  reviewCreateSchema,
  reviewListQuerySchema,
  reviewReplySchema,
} from "@eventsphere/shared";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { optionalAuthenticate } from "@/middlewares/optional-authenticate.js";
import { authorize } from "@/middlewares/authorize.js";
import * as social from "@/controllers/social.controller.js";

const eventIdParamSchema = z.object({ eventId: z.coerce.number().int().positive() });

/** Wishlist (docs/04 §13). */
export const wishlistRoutes = Router();
wishlistRoutes.use(authenticate, authorize("attendee"));
wishlistRoutes.get("/", social.wishlist);
wishlistRoutes.get("/ids", social.wishlistIds);
wishlistRoutes.post("/:eventId", validate({ params: eventIdParamSchema }), social.addWishlist);
wishlistRoutes.delete("/:eventId", validate({ params: eventIdParamSchema }), social.removeWishlist);

/** Reviews nested under events (docs/04 §12). */
export const eventReviewRoutes = Router();
eventReviewRoutes.get(
  "/:eventId/reviews",
  optionalAuthenticate,
  validate({ params: eventIdParamSchema, query: reviewListQuerySchema }),
  social.listReviews,
);
eventReviewRoutes.post(
  "/:eventId/reviews",
  authenticate,
  authorize("attendee"),
  validate({ params: eventIdParamSchema, body: reviewCreateSchema }),
  social.createReview,
);

export const reviewRoutes = Router();
reviewRoutes.post(
  "/:id/reply",
  authenticate,
  authorize("organizer", "super_admin"),
  validate({ params: idParamSchema, body: reviewReplySchema }),
  social.replyReview,
);
reviewRoutes.delete("/:id", authenticate, authorize("super_admin"), validate({ params: idParamSchema }), social.deleteReview);

/** Notification feed (docs/04 §14). */
export const notificationRoutes = Router();
notificationRoutes.use(authenticate);
notificationRoutes.get("/", validate({ query: paginationQuerySchema }), social.notifications);
notificationRoutes.patch("/read-all", social.markAllRead);
notificationRoutes.patch("/:id/read", validate({ params: idParamSchema }), social.markRead);
