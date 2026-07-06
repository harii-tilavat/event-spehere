import type { ErrorCode, FieldError } from "@eventsphere/shared";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly errors?: FieldError[],
  ) {
    super(message);
    this.name = "AppError";
  }
}
