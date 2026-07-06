import { Badge } from "@/components/ui/badge";
import { useHealth } from "../hooks/use-health";

export function HealthBadge() {
  const { data, isPending, isError } = useHealth();

  if (isPending) {
    return (
      <Badge variant="secondary">
        <span className="size-2 animate-pulse rounded-full bg-muted-foreground" />
        Checking API…
      </Badge>
    );
  }

  if (isError || !data) {
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
      API online · v{data.version}
    </Badge>
  );
}
