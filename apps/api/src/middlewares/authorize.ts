import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Role } from "@eventsphere/shared";
import { AppError } from "@/utils/app-error.js";
import { asyncHandler } from "@/utils/async-handler.js";
import { OrganizerProfile } from "@/models/index.js";

export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have access to this resource"));
    }
    next();
  };
}

/** Booking / event-creation actions require a verified email (docs/02 §4). */
export const requireVerifiedEmail: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
  if (!req.user.isEmailVerified) {
    return next(new AppError(403, "EMAIL_NOT_VERIFIED", "Please verify your email to continue"));
  }
  next();
};

/** Organizer endpoints require an approved organizer profile (docs/02 §4). */
export const requireApprovedOrganizer = asyncHandler(async (req, _res, next) => {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  if (req.user.role === "super_admin") return next();
  const profile = await OrganizerProfile.findOne({ where: { userId: req.user.id } });
  if (!profile || profile.approvalStatus !== "approved") {
    throw new AppError(403, "ORGANIZER_NOT_APPROVED", "Your organizer application has not been approved yet");
  }
  next();
});
