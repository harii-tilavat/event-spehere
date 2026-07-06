import { MutationCache, QueryClient } from "@tanstack/react-query";
import { isApiError, showErrorToast } from "./queryErrors";

/**
 * Global mutation-error toast: fires only when the consumer did not pass its own
 * onError (docs/react-query.md). 401s are already handled by the token-refresh
 * interceptor, so they are skipped here.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return;
      if (isApiError(error) && (error.code === "TOKEN_EXPIRED" || error.code === "UNAUTHORIZED")) return;
      showErrorToast(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
