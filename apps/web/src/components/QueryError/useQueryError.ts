import { getErrorMessage } from "@/api/core";
import type { QueryErrorView } from "./types";

/** Maps an unknown query error to presentation values (logic/presentation split). */
export function useQueryError(error: unknown): QueryErrorView {
  return { message: getErrorMessage(error) };
}
