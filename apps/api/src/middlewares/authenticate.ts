import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/app-error.js";
import { verifyAccessToken } from "@/utils/crypto.js";
import { asyncHandler } from "@/utils/async-handler.js";
import { User } from "@/models/index.js";

/** Verifies the Bearer access token and loads a fresh user (status re-checked per request). */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const payload = verifyAccessToken(header.slice(7));
  const user = await User.findByPk(Number(payload.sub));
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Account unavailable");
  if (user.status === "suspended") throw new AppError(403, "FORBIDDEN", "Your account has been suspended");

  req.user = user;
  next();
});
