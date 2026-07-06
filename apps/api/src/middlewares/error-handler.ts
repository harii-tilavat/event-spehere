import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiError } from "@eventsphere/shared";
import { AppError } from "@/utils/app-error.js";
import { isProd } from "@/config/env.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: ApiError = { success: false, message: err.message, code: err.code, errors: err.errors };
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    };
    res.status(400).json(body);
    return;
  }

  if (!isProd) console.error(err);
  const body: ApiError = { success: false, message: "Something went wrong", code: "INTERNAL_ERROR" };
  res.status(500).json(body);
}
