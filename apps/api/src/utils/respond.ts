import type { Response } from "express";
import type { ApiSuccess, Meta } from "@eventsphere/shared";

export function ok<T>(res: Response, message: string, data: T, options?: { status?: number; meta?: Meta }): void {
  const body: ApiSuccess<T> = { success: true, message, data, ...(options?.meta ? { meta: options.meta } : {}) };
  res.status(options?.status ?? 200).json(body);
}
