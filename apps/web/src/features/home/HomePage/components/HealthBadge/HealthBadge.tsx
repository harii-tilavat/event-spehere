import { Badge } from "@eventsphere/ui";
import { useHealthBadge } from "./useHealthBadge";

export function HealthBadge() {
  const { isPending, isOffline, version } = useHealthBadge();

  if (isPending) {
    return (
      <Badge variant="secondary">
        <span className="size-2 animate-pulse rounded-full bg-muted-foreground" />
        Checking API…
      </Badge>
    );
  }

  if (isOffline) {
    return (
      <Badge variant="destructive">
        <span className="size-2 rounded-full bg-destructive-foreground" />
        API offline
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      <span className="size-2 rounded-full bg-success" />
      API online · v{version}
    </Badge>
  );
}
