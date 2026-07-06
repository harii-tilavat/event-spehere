import { toast } from "sonner";
import type { ApiError } from "@eventsphere/shared";

export function isApiError(err: unknown): err is ApiError {
  return typeof err === "object" && err !== null && (err as ApiError).success === false;
}

export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function showErrorToast(err: unknown): void {
  toast.error(getErrorMessage(err));
}
