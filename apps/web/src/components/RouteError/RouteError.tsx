import { Link, useRouteError } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { Button } from "@eventsphere/ui";

/** Full-page route boundary — the default error layer (docs/react-query.md). */
export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Something went wrong loading this page";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-8 text-destructive" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
