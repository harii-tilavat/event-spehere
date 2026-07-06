import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Button, Card, CardContent } from "@eventsphere/ui";
import { useQueryError } from "./useQueryError";
import type { QueryErrorProps } from "./types";

/** Inline error for PRIMARY data views only (docs/react-query.md) — secondary widgets stay empty. */
export function QueryError({ error, onRetry }: QueryErrorProps) {
  const { message } = useQueryError(error);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <TriangleAlert className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw className="size-4" /> Try again
        </Button>
      </CardContent>
    </Card>
  );
}
